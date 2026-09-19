import { db } from "./connection";

export interface User {
  id: number;
  telegramId: number;
  name: string;
  username: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: number;
  telegram_id: number;
  name: string;
  username: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    name: row.name,
    username: row.username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getUserByTelegramId(telegramId: number): User | undefined {
  const row = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(telegramId) as UserRow | undefined;
  return row ? mapRow(row) : undefined;
}

export interface UpsertUserInput {
  telegramId: number;
  name: string;
  username?: string | null;
}

export function upsertUser(input: UpsertUserInput): User {
  db.prepare(
    `INSERT INTO users (telegram_id, name, username)
     VALUES (?, ?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET
       name = excluded.name,
       username = excluded.username,
       updated_at = datetime('now')`,
  ).run(input.telegramId, input.name, input.username ?? null);

  return getUserByTelegramId(input.telegramId)!;
}

export function listUsers(): User[] {
  const rows = db.prepare("SELECT * FROM users ORDER BY id").all() as UserRow[];
  return rows.map(mapRow);
}
