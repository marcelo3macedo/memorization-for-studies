import type Database from "better-sqlite3";

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('qa', 'flashcard', 'multiple_choice', 'discursive')),
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
      completed_at TEXT,
      pending_card_id INTEGER REFERENCES cards(id)
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

  // Migração para bancos criados antes da coluna pending_card_id existir
  // (rastreia o card discursivo aguardando resposta em texto livre na sessão).
  if (!sessionColumns.some((column) => column.name === "pending_card_id")) {
    db.exec("ALTER TABLE sessions ADD COLUMN pending_card_id INTEGER REFERENCES cards(id)");
  }

  migrateCardsTypeCheck(db);
}

/**
 * Migração para bancos criados antes do tipo 'discursive' existir. SQLite
 * não permite alterar um CHECK de uma tabela existente via ALTER TABLE, então
 * a tabela precisa ser recriada preservando os dados e o id de cada card
 * (referenciado por card_alternatives, user_card_views e session_cards).
 */
function migrateCardsTypeCheck(db: Database.Database): void {
  const table = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'cards'").get() as
    | { sql: string }
    | undefined;
  if (!table || table.sql.includes("'discursive'")) return;

  db.pragma("foreign_keys = OFF");
  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE cards_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK (type IN ('qa', 'flashcard', 'multiple_choice', 'discursive')),
          source TEXT NOT NULL CHECK (source IN ('oficiais', 'gerados')),
          file_path TEXT NOT NULL,
          title TEXT NOT NULL,
          front TEXT NOT NULL,
          back TEXT,
          explanation TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE (file_path, title)
        );

        INSERT INTO cards_new (id, type, source, file_path, title, front, back, explanation, created_at)
          SELECT id, type, source, file_path, title, front, back, explanation, created_at FROM cards;

        DROP TABLE cards;
        ALTER TABLE cards_new RENAME TO cards;

        CREATE INDEX IF NOT EXISTS idx_cards_type ON cards (type);
        CREATE INDEX IF NOT EXISTS idx_cards_source ON cards (source);
      `);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }
}
