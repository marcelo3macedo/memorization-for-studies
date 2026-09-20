import { incrementCardView, pickCardsForSession } from "../database/cardViewsRepository";
import {
  addSessionCards,
  clearPendingCard,
  createSession,
  getLatestSession,
  getSessionCards,
  markSessionCardAnswered,
  markSessionCompleted,
  setPendingCard,
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

/**
 * Sessões criadas antes da existência de `completed_at` (ou que, por algum
 * motivo, não passaram pelo fluxo normal de "Próximo") podem ter todos os
 * cards respondidos — ou nem ter card nenhum, caso tenham sido criadas
 * quando a tabela `cards` ainda estava vazia — sem nunca terem sido
 * marcadas como concluídas. Ficam "presas". `every` numa lista vazia é
 * `true`, então uma sessão sem cards também conta como "sem nada pendente".
 * Detecta esses casos recomputando a partir dos session_cards.
 */
function isSessionDone(session: Session): boolean {
  const cards = getSessionCards(session.id);
  return cards.every((card) => card.answeredAt !== null);
}

/** Uma sessão precisa ser renovada se já foi concluída, expirou por tempo, ou está presa (nada pendente nela). */
function needsNewSession(session: Session): boolean {
  if (session.completedAt !== null || isExpired(session)) return true;

  if (isSessionDone(session)) {
    markSessionCompleted(session.id);
    return true;
  }

  return false;
}

export interface ActiveSession {
  session: Session;
  cards: SessionCard[];
  isNew: boolean;
}

/**
 * Garante uma sessão ativa para o usuário: reaproveita a última sessão se
 * ela ainda estiver dentro da janela de 2 horas e não tiver sido concluída,
 * ou cria uma nova (primeira mensagem do usuário, mais de 2h desde a
 * última, ou a última já foi finalizada) selecionando cards priorizando os
 * menos vistos por ele.
 */
export function ensureSession(userId: number): ActiveSession {
  const latest = getLatestSession(userId);

  if (latest && !needsNewSession(latest)) {
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

/** Marca que a sessão está aguardando a resposta em texto livre de um card discursivo. */
export function markPendingDiscursiveCard(sessionId: number, cardId: number): void {
  setPendingCard(sessionId, cardId);
}

/** Limpa a espera por resposta discursiva, geralmente após avaliar ou descartar o card pendente. */
export function clearPendingDiscursiveCard(sessionId: number): void {
  clearPendingCard(sessionId);
}

export interface NextSessionCard {
  sessionCard: SessionCard | null;
  totalCards: number;
  answeredCount: number;
}

/**
 * Próximo card pendente da sessão (por posição). Se não houver mais
 * pendentes, marca a sessão como concluída — isso faz `ensureSession`
 * abrir uma nova sessão na próxima mensagem do usuário, mesmo que ainda
 * esteja dentro da janela de 2 horas.
 */
export function getNextSessionCard(sessionId: number): NextSessionCard {
  const cards = getSessionCards(sessionId);
  const answeredCount = cards.filter((card) => card.answeredAt !== null).length;
  const sessionCard = cards.find((card) => card.answeredAt === null) ?? null;

  if (!sessionCard) {
    markSessionCompleted(sessionId);
  }

  return { sessionCard, totalCards: cards.length, answeredCount };
}
