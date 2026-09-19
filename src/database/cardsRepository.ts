import { db } from "./connection";
import type { Card, CardAlternative, CardSource, CardType } from "./types";

interface CardRow {
  id: number;
  type: CardType;
  source: CardSource;
  file_path: string;
  title: string;
  front: string;
  back: string | null;
  explanation: string | null;
  created_at: string;
}

interface AlternativeRow {
  card_id: number;
  label: string;
  text: string;
  is_correct: number;
}

function attachAlternatives(rows: CardRow[]): Card[] {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(",");
  const alternativeRows = db
    .prepare(
      `SELECT card_id, label, text, is_correct FROM card_alternatives WHERE card_id IN (${placeholders}) ORDER BY label`,
    )
    .all(...ids) as AlternativeRow[];

  const alternativesByCard = new Map<number, CardAlternative[]>();
  for (const row of alternativeRows) {
    const list = alternativesByCard.get(row.card_id) ?? [];
    list.push({ label: row.label, text: row.text, isCorrect: row.is_correct === 1 });
    alternativesByCard.set(row.card_id, list);
  }

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    source: row.source,
    filePath: row.file_path,
    title: row.title,
    front: row.front,
    back: row.back,
    explanation: row.explanation,
    createdAt: row.created_at,
    alternatives: alternativesByCard.get(row.id) ?? [],
  }));
}

export interface CardFilters {
  type?: CardType;
  source?: CardSource;
}

function buildWhereClause(filters: CardFilters): { where: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }
  if (filters.source) {
    conditions.push("source = ?");
    params.push(filters.source);
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export function listCards(filters: CardFilters = {}): Card[] {
  const { where, params } = buildWhereClause(filters);
  const rows = db.prepare(`SELECT * FROM cards ${where} ORDER BY id`).all(...params) as CardRow[];
  return attachAlternatives(rows);
}

export function getCardById(id: number): Card | undefined {
  const row = db.prepare("SELECT * FROM cards WHERE id = ?").get(id) as CardRow | undefined;
  if (!row) return undefined;
  return attachAlternatives([row])[0];
}

export function getRandomCard(filters: CardFilters = {}): Card | undefined {
  const { where, params } = buildWhereClause(filters);
  const row = db.prepare(`SELECT * FROM cards ${where} ORDER BY RANDOM() LIMIT 1`).get(...params) as
    | CardRow
    | undefined;
  if (!row) return undefined;
  return attachAlternatives([row])[0];
}

export function countCards(filters: CardFilters = {}): number {
  const { where, params } = buildWhereClause(filters);
  const row = db.prepare(`SELECT COUNT(*) AS count FROM cards ${where}`).get(...params) as { count: number };
  return row.count;
}

export function cardExists(filePath: string, title: string): boolean {
  const row = db.prepare("SELECT id FROM cards WHERE file_path = ? AND title = ?").get(filePath, title);
  return row !== undefined;
}

export interface NewCardInput {
  type: CardType;
  source: CardSource;
  filePath: string;
  title: string;
  front: string;
  back?: string | null;
  explanation?: string | null;
  alternatives?: CardAlternative[];
}

export function insertCard(input: NewCardInput): number {
  const insertCardStmt = db.prepare(
    "INSERT INTO cards (type, source, file_path, title, front, back, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );

  const info = insertCardStmt.run(
    input.type,
    input.source,
    input.filePath,
    input.title,
    input.front,
    input.back ?? null,
    input.explanation ?? null,
  );

  const cardId = Number(info.lastInsertRowid);

  if (input.alternatives && input.alternatives.length > 0) {
    const insertAlternativeStmt = db.prepare(
      "INSERT INTO card_alternatives (card_id, label, text, is_correct) VALUES (?, ?, ?, ?)",
    );
    for (const alternative of input.alternatives) {
      insertAlternativeStmt.run(cardId, alternative.label, alternative.text, alternative.isCorrect ? 1 : 0);
    }
  }

  return cardId;
}
