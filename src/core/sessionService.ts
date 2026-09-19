import { incrementCardView, pickCardsForSession } from "../database/cardViewsRepository";
import {
  addSessionCards,
  createSession,
  getLatestSession,
  getSessionCards,
  markSessionCardAnswered,
  touchSession,
  type Session,
  type SessionCard,
} from "../database/sessionsRepository";

const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas sem mensagens encerra a sessão
const SESSION_CARD_COUNT = Number(process.env.SESSION_CARD_COUNT ?? 10);

function toDate(sqliteDatetime: string): Date {
  // SQLite datetime('now') retorna "YYYY-MM-DD HH:MM:SS" em UTC, sem indicador de fuso.
  return new Date(`${sqliteDatetime.replace(" ", "T")}Z`);
}

function isExpired(session: Session): boolean {
  return Date.now() - toDate(session.lastActivityAt).getTime() > SESSION_TIMEOUT_MS;
}

export interface ActiveSession {
  session: Session;
  cards: SessionCard[];
  isNew: boolean;
}

/**
 * Garante uma sessão ativa para o usuário: reaproveita a última sessão se
 * ela ainda estiver dentro da janela de 2 horas, ou cria uma nova (primeira
 * mensagem do usuário, ou mais de 2h desde a última) selecionando cards
 * priorizando os menos vistos por ele.
 */
export function ensureSession(userId: number): ActiveSession {
  const latest = getLatestSession(userId);

  if (latest && !isExpired(latest)) {
    touchSession(latest.id);
    return { session: latest, cards: getSessionCards(latest.id), isNew: false };
  }

  const session = createSession(userId);
  const cardIds = pickCardsForSession(userId, SESSION_CARD_COUNT);
  addSessionCards(session.id, cardIds);

  return { session, cards: getSessionCards(session.id), isNew: true };
}

/**
 * Registra que o usuário interagiu (respondeu) a um card: incrementa o
 * contador de visualizações dele para esse usuário e marca o card como
 * respondido na sessão ativa, se houver.
 */
export function registerCardInteraction(userId: number, cardId: number): void {
  incrementCardView(userId, cardId);

  const latest = getLatestSession(userId);
  if (latest) {
    markSessionCardAnswered(latest.id, cardId);
    touchSession(latest.id);
  }
}
