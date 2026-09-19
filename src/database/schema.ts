import type Database from "better-sqlite3";

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('qa', 'flashcard', 'multiple_choice')),
      source TEXT NOT NULL CHECK (source IN ('oficiais', 'gerados')),
      file_path TEXT NOT NULL,
      title TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT,
      explanation TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (file_path, title)
    );

    CREATE TABLE IF NOT EXISTS card_alternatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1))
    );

    CREATE INDEX IF NOT EXISTS idx_cards_type ON cards (type);
    CREATE INDEX IF NOT EXISTS idx_cards_source ON cards (source);
    CREATE INDEX IF NOT EXISTS idx_card_alternatives_card_id ON card_alternatives (card_id);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      username TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_activity_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

    CREATE TABLE IF NOT EXISTS session_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      answered_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_session_cards_session_id ON session_cards (session_id);

    CREATE TABLE IF NOT EXISTS user_card_views (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      view_count INTEGER NOT NULL DEFAULT 0,
      last_viewed_at TEXT,
      PRIMARY KEY (user_id, card_id)
    );
  `);

  // Migração para bancos criados antes da coluna completed_at existir.
  const sessionColumns = db.prepare("PRAGMA table_info(sessions)").all() as { name: string }[];
  if (!sessionColumns.some((column) => column.name === "completed_at")) {
    db.exec("ALTER TABLE sessions ADD COLUMN completed_at TEXT");
  }
}
