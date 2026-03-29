const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'tax.db');
let db = null;

// Save DB to disk periodically
function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Initialize DB
async function init() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT DEFAULT '',
      last_name TEXT DEFAULT '',
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT DEFAULT '',
      user_id TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tax_data (
      session_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER,
      base64 TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_state (
      user_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      current_step INTEGER DEFAULT 0,
      filing_status TEXT DEFAULT '',
      deduction_type TEXT DEFAULT 'standard',
      selected_credits TEXT DEFAULT '{}',
      guide_progress TEXT DEFAULT '{}',
      last_page TEXT DEFAULT 'index.html',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  persist();
  // Auto-save every 30 seconds
  setInterval(persist, 30000);

  console.log('  Database initialized ✓');
  return db;
}

// ── Helpers ──
function ensureSession(sessionId, name = '') {
  const exists = db.exec(`SELECT id FROM sessions WHERE id = '${sessionId}'`);
  if (exists.length === 0 || exists[0].values.length === 0) {
    db.run(`INSERT INTO sessions (id, name) VALUES (?, ?)`, [sessionId, name]);
  } else {
    db.run(`UPDATE sessions SET updated_at = datetime('now') WHERE id = ?`, [sessionId]);
  }
}

module.exports = {
  init,

  // ── Auth Methods ──
  createUser(id, email, passwordHash, firstName, lastName, language) {
    db.run(`INSERT INTO users (id, email, password_hash, first_name, last_name, language) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, email, passwordHash, firstName, lastName, language]);
    persist();
  },

  getUserByEmail(email) {
    const result = db.exec(`SELECT id, email, password_hash, first_name, last_name, language, created_at, last_login FROM users WHERE email = ?`, [email]);
    if (!result.length || !result[0].values.length) return null;
    const r = result[0].values[0];
    return {
      id: r[0],
      email: r[1],
      password_hash: r[2],
      first_name: r[3],
      last_name: r[4],
      language: r[5],
      created_at: r[6],
      last_login: r[7]
    };
  },

  getUserById(id) {
    const result = db.exec(`SELECT id, email, password_hash, first_name, last_name, language, created_at, last_login FROM users WHERE id = ?`, [id]);
    if (!result.length || !result[0].values.length) return null;
    const r = result[0].values[0];
    return {
      id: r[0],
      email: r[1],
      password_hash: r[2],
      first_name: r[3],
      last_name: r[4],
      language: r[5],
      created_at: r[6],
      last_login: r[7]
    };
  },

  saveAuthToken(token, userId, expiresAt) {
    db.run(`INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (?, ?, ?)`,
      [token, userId, expiresAt]);
    persist();
  },

  getAuthToken(token) {
    const result = db.exec(`SELECT token, user_id, created_at, expires_at FROM auth_tokens WHERE token = ? AND expires_at > datetime('now')`, [token]);
    if (!result.length || !result[0].values.length) return null;
    const r = result[0].values[0];
    return {
      token: r[0],
      user_id: r[1],
      created_at: r[2],
      expires_at: r[3]
    };
  },

  deleteAuthToken(token) {
    db.run(`DELETE FROM auth_tokens WHERE token = ?`, [token]);
    persist();
  },

  updateLastLogin(userId) {
    db.run(`UPDATE users SET last_login = datetime('now') WHERE id = ?`, [userId]);
    persist();
  },

  linkSessionToUser(sessionId, userId) {
    db.run(`UPDATE sessions SET user_id = ? WHERE id = ?`, [userId, sessionId]);
    persist();
  },

  getUserSessions(userId) {
    const result = db.exec(`
      SELECT s.id, s.name, s.created_at, s.updated_at,
        (SELECT COUNT(*) FROM documents WHERE session_id = s.id) as doc_count
      FROM sessions s WHERE s.user_id = ? ORDER BY s.updated_at DESC
    `, [userId]);
    if (!result.length) return [];
    return result[0].values.map(r => ({
      id: r[0], name: r[1], created_at: r[2], updated_at: r[3], doc_count: r[4]
    }));
  },

  listSessions() {
    const result = db.exec(`
      SELECT s.id, s.name, s.created_at, s.updated_at,
        (SELECT COUNT(*) FROM documents WHERE session_id = s.id) as doc_count
      FROM sessions s ORDER BY s.updated_at DESC
    `);
    if (!result.length) return [];
    return result[0].values.map(r => ({
      id: r[0], name: r[1], created_at: r[2], updated_at: r[3], doc_count: r[4]
    }));
  },

  deleteSession(sessionId) {
    db.run(`DELETE FROM tax_data WHERE session_id = ?`, [sessionId]);
    db.run(`DELETE FROM documents WHERE session_id = ?`, [sessionId]);
    db.run(`DELETE FROM chat_history WHERE session_id = ?`, [sessionId]);
    db.run(`DELETE FROM sessions WHERE id = ?`, [sessionId]);
    persist();
  },

  saveTaxData(sessionId, data) {
    ensureSession(sessionId, data.personal?.firstName || '');
    const exists = db.exec(`SELECT session_id FROM tax_data WHERE session_id = '${sessionId}'`);
    if (exists.length === 0 || exists[0].values.length === 0) {
      db.run(`INSERT INTO tax_data (session_id, data) VALUES (?, ?)`, [sessionId, JSON.stringify(data)]);
    } else {
      db.run(`UPDATE tax_data SET data = ?, updated_at = datetime('now') WHERE session_id = ?`, [JSON.stringify(data), sessionId]);
    }
    persist();
  },

  loadTaxData(sessionId) {
    const result = db.exec(`SELECT data FROM tax_data WHERE session_id = '${sessionId}'`);
    if (!result.length || !result[0].values.length) return null;
    return JSON.parse(result[0].values[0][0]);
  },

  saveDocument(sessionId, file) {
    ensureSession(sessionId);
    db.run(`INSERT OR REPLACE INTO documents (id, session_id, name, type, size, base64) VALUES (?, ?, ?, ?, ?, ?)`,
      [file.id, sessionId, file.name, file.type, file.size, file.base64]);
    persist();
  },

  getDocuments(sessionId) {
    const result = db.exec(`SELECT id, name, type, size FROM documents WHERE session_id = '${sessionId}'`);
    if (!result.length) return [];
    return result[0].values.map(r => ({ id: r[0], name: r[1], type: r[2], size: r[3] }));
  },

  saveChatMessage(sessionId, role, content) {
    ensureSession(sessionId);
    db.run(`INSERT INTO chat_history (session_id, role, content) VALUES (?, ?, ?)`, [sessionId, role, content]);
    persist();
  },

  getChatHistory(sessionId) {
    const result = db.exec(`SELECT role, content, created_at FROM chat_history WHERE session_id = '${sessionId}' ORDER BY created_at ASC`);
    if (!result.length) return [];
    return result[0].values.map(r => ({ role: r[0], content: r[1], created_at: r[2] }));
  },

  clearChatHistory(sessionId) {
    db.run(`DELETE FROM chat_history WHERE session_id = ?`, [sessionId]);
    persist();
  },

  getFileById(fileId) {
    const result = db.exec(`SELECT name, type, base64 FROM documents WHERE id = '${fileId}'`);
    if (!result.length || !result[0].values.length) return null;
    const r = result[0].values[0];
    return { name: r[0], type: r[1], base64: r[2] };
  },

  saveUserState(userId, stateData) {
    const exists = db.exec(`SELECT user_id FROM user_state WHERE user_id = ?`, [userId]);
    if (!exists.length || !exists[0].values.length) {
      db.run(`INSERT INTO user_state (user_id, session_id, current_step, filing_status, deduction_type, selected_credits, guide_progress, last_page) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, stateData.sessionId || '', stateData.currentStep || 0, stateData.filingStatus || '', stateData.deductionType || 'standard', JSON.stringify(stateData.selectedCredits || {}), JSON.stringify(stateData.guideProgress || {}), stateData.lastPage || 'index.html']);
    } else {
      db.run(`UPDATE user_state SET session_id = ?, current_step = ?, filing_status = ?, deduction_type = ?, selected_credits = ?, guide_progress = ?, last_page = ?, updated_at = datetime('now') WHERE user_id = ?`,
        [stateData.sessionId || '', stateData.currentStep || 0, stateData.filingStatus || '', stateData.deductionType || 'standard', JSON.stringify(stateData.selectedCredits || {}), JSON.stringify(stateData.guideProgress || {}), stateData.lastPage || 'index.html', userId]);
    }
    persist();
  },

  getUserState(userId) {
    const result = db.exec(`SELECT session_id, current_step, filing_status, deduction_type, selected_credits, guide_progress, last_page, updated_at FROM user_state WHERE user_id = ?`, [userId]);
    if (!result.length || !result[0].values.length) return null;
    const r = result[0].values[0];
    return {
      sessionId: r[0],
      currentStep: r[1],
      filingStatus: r[2],
      deductionType: r[3],
      selectedCredits: JSON.parse(r[4] || '{}'),
      guideProgress: JSON.parse(r[5] || '{}'),
      lastPage: r[6],
      updatedAt: r[7]
    };
  }
};
