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
  `);
}
