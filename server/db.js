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
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT DEFAULT '',
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
  }
};
