import { db } from "./connection";

export function incrementCardView(userId: number, cardId: number): void {
  db.prepare(
    `INSERT INTO user_card_views (user_id, card_id, view_count, last_viewed_at)
     VALUES (?, ?, 1, datetime('now'))
     ON CONFLICT(user_id, card_id) DO UPDATE SET
       view_count = view_count + 1,
       last_viewed_at = datetime('now')`,
  ).run(userId, cardId);
}

export function getViewCount(userId: number, cardId: number): number {
  const row = db
    .prepare("SELECT view_count FROM user_card_views WHERE user_id = ? AND card_id = ?")
    .get(userId, cardId) as { view_count: number } | undefined;
  return row?.view_count ?? 0;
}

/**
 * Seleciona cards para uma sessão priorizando os menos vistos pelo usuário
 * (cards nunca vistos entram com view_count 0). Dentro do mesmo nível de
 * visualizações, a ordem é sorteada.
 */
export function pickCardsForSession(userId: number, limit: number): number[] {
  const rows = db
    .prepare(
      `SELECT c.id
       FROM cards c
       LEFT JOIN user_card_views v ON v.card_id = c.id AND v.user_id = ?
       ORDER BY COALESCE(v.view_count, 0) ASC, RANDOM()
       LIMIT ?`,
    )
    .all(userId, limit) as { id: number }[];

  return rows.map((row) => row.id);
}
