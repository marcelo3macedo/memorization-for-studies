import { db } from "./connection";

export interface Session {
  id: number;
  userId: number;
  startedAt: string;
  lastActivityAt: string;
  completedAt: string | null;
}

interface SessionRow {
  id: number;
  user_id: number;
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
}

function mapSession(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    startedAt: row.started_at,
    lastActivityAt: row.last_activity_at,
    completedAt: row.completed_at,
  };
}

export function getLatestSession(userId: number): Session | undefined {
  const row = db
    .prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY last_activity_at DESC LIMIT 1")
    .get(userId) as SessionRow | undefined;
  return row ? mapSession(row) : undefined;
}

export function getSessionById(id: number): Session | undefined {
  const row = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) as SessionRow | undefined;
  return row ? mapSession(row) : undefined;
}

export function createSession(userId: number): Session {
  const info = db.prepare("INSERT INTO sessions (user_id) VALUES (?)").run(userId);
  return getSessionById(Number(info.lastInsertRowid))!;
}

export function touchSession(sessionId: number): void {
  db.prepare("UPDATE sessions SET last_activity_at = datetime('now') WHERE id = ?").run(sessionId);
}

export function markSessionCompleted(sessionId: number): void {
  db.prepare("UPDATE sessions SET completed_at = COALESCE(completed_at, datetime('now')) WHERE id = ?").run(
    sessionId,
  );
}

export interface SessionCard {
  id: number;
  sessionId: number;
  cardId: number;
  position: number;
  answeredAt: string | null;
}

interface SessionCardRow {
  id: number;
  session_id: number;
  card_id: number;
  position: number;
  answered_at: string | null;
}

function mapSessionCard(row: SessionCardRow): SessionCard {
  return {
    id: row.id,
    sessionId: row.session_id,
    cardId: row.card_id,
    position: row.position,
    answeredAt: row.answered_at,
  };
}

export function addSessionCards(sessionId: number, cardIds: number[]): void {
  const insertStmt = db.prepare("INSERT INTO session_cards (session_id, card_id, position) VALUES (?, ?, ?)");

  const insertMany = db.transaction((ids: number[]) => {
    ids.forEach((cardId, index) => insertStmt.run(sessionId, cardId, index));
  });

  insertMany(cardIds);
}

export function getSessionCards(sessionId: number): SessionCard[] {
  const rows = db
    .prepare("SELECT * FROM session_cards WHERE session_id = ? ORDER BY position")
    .all(sessionId) as SessionCardRow[];
  return rows.map(mapSessionCard);
}

export function markSessionCardAnswered(sessionId: number, cardId: number): void {
  db.prepare(
    `UPDATE session_cards SET answered_at = datetime('now')
     WHERE session_id = ? AND card_id = ? AND answered_at IS NULL`,
  ).run(sessionId, cardId);
}
