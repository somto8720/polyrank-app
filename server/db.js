/**
 * db.js — SQLite database setup and helpers for PolyRank.
 *
 * Uses sql.js (pure-JS SQLite compiled via Emscripten) so no native build tools
 * are required. The database is persisted to disk manually after writes.
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'polyrank.db');

let _db = null;
let _initPromise = null;

/**
 * Persist the in-memory database to disk.
 * Called after every write operation to ensure durability.
 */
function persist() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Returns the singleton database instance.
 * On first call, initialises sql.js WASM and creates tables/indexes.
 * Must be awaited on first use; subsequent calls return synchronously via cache.
 */
async function getDb() {
  if (_db) return _db;

  // Prevent double-init if called concurrently during startup
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const SQL = await initSqlJs();

    // Load existing DB from disk, or create a new one
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      _db = new SQL.Database(fileBuffer);
    } else {
      _db = new SQL.Database();
    }

    // --------------- Tables ---------------

    _db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        handle TEXT PRIMARY KEY,
        display_name TEXT,
        avatar_url TEXT,
        total_views INTEGER DEFAULT 0,
        total_tweets INTEGER DEFAULT 0,
        total_replies INTEGER DEFAULT 0,
        avg_views_per_tweet REAL DEFAULT 0,
        current_rank INTEGER,
        previous_rank INTEGER,
        rank_change INTEGER DEFAULT 0,
        first_seen TEXT,
        last_updated TEXT
      );
    `);

    _db.run(`
      CREATE TABLE IF NOT EXISTS tweets (
        tweet_id TEXT PRIMARY KEY,
        author_handle TEXT,
        text_snippet TEXT,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        retweet_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        is_reply INTEGER DEFAULT 0,
        is_quote INTEGER DEFAULT 0,
        created_at TEXT,
        fetched_at TEXT,
        FOREIGN KEY (author_handle) REFERENCES accounts(handle)
      );
    `);

    _db.run(`
      CREATE TABLE IF NOT EXISTS daily_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handle TEXT,
        date TEXT,
        rank INTEGER,
        total_views INTEGER,
        total_tweets INTEGER,
        UNIQUE(handle, date)
      );
    `);

    _db.run(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // --------------- Indexes ---------------

    _db.run(`CREATE INDEX IF NOT EXISTS idx_accounts_rank   ON accounts(current_rank);`);
    _db.run(`CREATE INDEX IF NOT EXISTS idx_accounts_views  ON accounts(total_views);`);
    _db.run(`CREATE INDEX IF NOT EXISTS idx_tweets_author   ON tweets(author_handle);`);
    _db.run(`CREATE INDEX IF NOT EXISTS idx_snapshots_hd    ON daily_snapshots(handle, date);`);

    persist();
    return _db;
  })();

  return _initPromise;
}

// ──────────────────────────────────────────────────────────
//  Query helpers  (wrap sql.js's lower-level API)
// ──────────────────────────────────────────────────────────

/**
 * Run a statement that returns no rows (INSERT, UPDATE, DELETE, etc.).
 * Accepts positional params: runStmt(db, sql, [val1, val2, ...])
 */
function runStmt(db, sql, params = []) {
  db.run(sql, params);
  persist();
}

/**
 * Execute a query and return an array of plain objects.
 * e.g. queryAll(db, 'SELECT * FROM accounts WHERE handle = ?', ['elonmusk'])
 */
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Execute a query and return the first row as a plain object, or null.
 */
function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// ──────────────────────────────────────────────────────────
//  Meta helpers
// ──────────────────────────────────────────────────────────

/**
 * Upsert a key-value pair into the meta table.
 */
function updateMeta(key, value) {
  if (!_db) throw new Error('DB not initialised — call getDb() first');
  runStmt(_db, `INSERT INTO meta (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [key, String(value)]);
}

/**
 * Read a value from the meta table. Returns null if the key doesn't exist.
 */
function getMeta(key) {
  if (!_db) throw new Error('DB not initialised — call getDb() first');
  const row = queryOne(_db, 'SELECT value FROM meta WHERE key = ?', [key]);
  return row ? row.value : null;
}

module.exports = { getDb, updateMeta, getMeta, runStmt, queryAll, queryOne, persist };
