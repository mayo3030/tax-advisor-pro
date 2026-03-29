const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('./db');
const pdfGenerator = require('./pdf-generator');

// Polyfill fetch for Node < 18
if (typeof globalThis.fetch === 'undefined') {
  try {
    const nodeFetch = require('node-fetch');
    globalThis.fetch = nodeFetch;
  } catch (e) {
    console.error('\n  [ERROR] Your Node.js version does not have fetch() built-in.');
    console.error('  Either upgrade to Node 18+ OR run: npm install node-fetch@2');
    console.error('  Then restart the server.\n');
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
// ── CORS — restrict to own domain ──
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:' + PORT,
  'https://minaandrawes4.srv978932.hstgr.cloud',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Security Headers ──
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.anthropic.com",
    "frame-ancestors 'self'"
  ].join('; '));
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// File upload config
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

// ══════════════════════════════════════════════
// ── API PROXY — keeps Claude API key on server ──
// ══════════════════════════════════════════════

app.post('/api/claude', async (req, res) => {
  try {
    const { messages, max_tokens = 4096 } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        max_tokens,
        messages
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData.error?.message || `Claude API error: ${response.status}`
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ── DOCUMENT UPLOAD — receive files from frontend ──
// ══════════════════════════════════════════════

app.post('/api/upload', upload.array('documents', 10), (req, res) => {
  try {
    const sessionId = req.body.sessionId || uuidv4();
    const files = req.files.map(f => ({
      id: uuidv4(),
      name: f.originalname,
      type: f.mimetype,
      size: f.size,
      base64: f.buffer.toString('base64')
    }));

    // Store in DB
    for (const file of files) {
      db.saveDocument(sessionId, file);
    }

    res.json({ sessionId, files: files.map(f => ({ id: f.id, name: f.name, type: f.type, size: f.size })) });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ── TAX DATA — save & load ──
// ══════════════════════════════════════════════

// Save tax data (all form fields)
app.post('/api/tax-data', (req, res) => {
  try {
    const { sessionId, data } = req.body;
    if (!sessionId || !data) {
      return res.status(400).json({ error: 'sessionId and data are required' });
    }
    db.saveTaxData(sessionId, data);
    res.json({ success: true, sessionId });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Load tax data
app.get('/api/tax-data/:sessionId', (req, res) => {
  try {
    const data = db.loadTaxData(req.params.sessionId);
    if (!data) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(data);
  } catch (err) {
    console.error('Load error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// List all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.listSessions();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a session
app.delete('/api/tax-data/:sessionId', (req, res) => {
  try {
    db.deleteSession(req.params.sessionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ── PDF GENERATION — IRS forms ──
// ══════════════════════════════════════════════

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { taxData, formType = '1040' } = req.body;
    if (!taxData) {
      return res.status(400).json({ error: 'taxData is required' });
    }

    const pdfBuffer = await pdfGenerator.generate(taxData, formType);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="TaxReturn_${formType}_2025.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ── CHAT HISTORY — save & load messages ──
// ══════════════════════════════════════════════

// Save a single chat message
app.post('/api/chat', (req, res) => {
  try {
    const { sessionId, role, content, attachment } = req.body;
    if (!sessionId || !role || !content) {
      return res.status(400).json({ error: 'sessionId, role, and content are required' });
    }
    // Store attachment metadata in the content as JSON if present
    const msgContent = attachment
      ? JSON.stringify({ text: content, attachment })
      : content;
    db.saveChatMessage(sessionId, role, msgContent);
    res.json({ success: true });
  } catch (err) {
    console.error('Chat save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Load full chat history for a session
app.get('/api/chat/:sessionId', (req, res) => {
  try {
    const history = db.getChatHistory(req.params.sessionId);
    res.json(history);
  } catch (err) {
    console.error('Chat load error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Clear chat history for a session
app.delete('/api/chat/:sessionId', (req, res) => {
  try {
    db.clearChatHistory
      ? db.clearChatHistory(req.params.sessionId)
      : db.run && db.run(`DELETE FROM chat_history WHERE session_id = ?`, [req.params.sessionId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ── FILE UPLOAD FOR CHAT — images & documents ──
// ══════════════════════════════════════════════

// Upload a file specifically for chat (returns URL to retrieve it)
app.post('/api/chat-upload', upload.single('file'), (req, res) => {
  try {
    const sessionId = req.body.sessionId || uuidv4();
    const f = req.file;
    if (!f) return res.status(400).json({ error: 'No file provided' });

    const fileId = uuidv4();
    const fileObj = {
      id: fileId,
      name: f.originalname,
      type: f.mimetype,
      size: f.size,
      base64: f.buffer.toString('base64')
    };
    db.saveDocument(sessionId, fileObj);

    res.json({
      id: fileId,
      name: f.originalname,
      type: f.mimetype,
      size: f.size,
      url: `/api/file/${fileId}`
    });
  } catch (err) {
    console.error('Chat upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve a file by ID (for displaying images/docs in chat)
app.get('/api/file/:fileId', (req, res) => {
  try {
    const fileData = db.getFileById(req.params.fileId);
    if (!fileData) return res.status(404).json({ error: 'File not found' });

    const buffer = Buffer.from(fileData.base64, 'base64');
    res.setHeader('Content-Type', fileData.type);
    res.setHeader('Content-Disposition', `inline; filename="${fileData.name}"`);
    res.send(buffer);
  } catch (err) {
    console.error('File serve error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// ── AUTH — signup, login, logout, profile ──
// ══════════════════════════════════════════════

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verify;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const authData = db.getAuthToken(token);
  if (!authData) return res.status(401).json({ error: 'Invalid or expired token' });
  req.userId = authData.user_id;
  next();
}

// Signup
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, firstName, lastName, language } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = db.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const userId = uuidv4();
    const passwordHash = hashPassword(password);
    db.createUser(userId, email, passwordHash, firstName || '', lastName || '', language || 'en');

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    db.saveAuthToken(token, userId, expires);
    db.updateLastLogin(userId);

    res.json({ token, user: { id: userId, email, firstName, lastName, language } });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.saveAuthToken(token, user.id, expires);
    db.updateLastLogin(user.id);

    res.json({ token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, language: user.language } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) db.deleteAuthToken(token);
  res.json({ success: true });
});

// Get profile
app.get('/api/auth/profile', requireAuth, (req, res) => {
  try {
    const user = db.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, language: user.language });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Link session to user
app.post('/api/auth/link-session', requireAuth, (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    db.linkSessionToUser(sessionId, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's sessions (prior year data)
app.get('/api/auth/sessions', requireAuth, (req, res) => {
  try {
    const sessions = db.getUserSessions(req.userId);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SPA fallback ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start (async for DB init) ──
(async () => {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`\n  🏛️  Tax Advisor Pro`);
      console.log(`  ────────────────────────────────────`);
      console.log(`  Server:   http://localhost:${PORT}`);
      console.log(`  API key:  ${process.env.ANTHROPIC_API_KEY ? '✓ loaded' : '✕ MISSING — check .env'}`);
      console.log(`  Database: ./data/tax.db`);
      console.log(`  Model:    ${process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'}`);
      console.log(`  ────────────────────────────────────`);
      console.log(`  Ready! Open http://localhost:${PORT} in your browser.\n`);
    });
  } catch (err) {
    console.error('\n  [ERROR] Failed to start server:', err.message);
    console.error('  Check that all dependencies are installed: npm install\n');
    process.exit(1);
  }
})();
