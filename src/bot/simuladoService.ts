import { listCards } from "../database/cardsRepository";
import type { Card } from "../database/types";

const SIMULADO_CARD_COUNT = 20;

export interface SimuladoResult {
  cardId: number;
  correct: boolean | null; // null = card de revelação (sem pontuação)
}

export interface SimuladoState {
  cards: Card[];
  currentIndex: number;
  results: SimuladoResult[];
  pendingCardId?: number; // card discursivo aguardando resposta de texto
}

// Estado em memória: userId → SimuladoState
const simuladoByUser = new Map<number, SimuladoState>();

export function startSimulado(userId: number): SimuladoState {
  const allCards = listCards();
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const cards = shuffled.slice(0, SIMULADO_CARD_COUNT);

  const state: SimuladoState = { cards, currentIndex: 0, results: [] };
  simuladoByUser.set(userId, state);
  return state;
}

export function getSimuladoState(userId: number): SimuladoState | undefined {
  return simuladoByUser.get(userId);
}

export function clearSimulado(userId: number): void {
  simuladoByUser.delete(userId);
}

export function recordSimuladoResult(userId: number, cardId: number, correct: boolean | null): void {
  const state = simuladoByUser.get(userId);
  if (state) state.results.push({ cardId, correct });
}

export function advanceSimulado(userId: number): { card: Card | null; current: number; total: number } {
  const state = simuladoByUser.get(userId);
  if (!state) return { card: null, current: 0, total: 0 };

  state.currentIndex++;
  const card = state.cards[state.currentIndex] ?? null;
  return { card, current: state.currentIndex + 1, total: state.cards.length };
}

export function setSimuladoPendingCard(userId: number, cardId: number): void {
  const state = simuladoByUser.get(userId);
  if (state) state.pendingCardId = cardId;
}

export function clearSimuladoPendingCard(userId: number): void {
  const state = simuladoByUser.get(userId);
  if (state) delete state.pendingCardId;
}

export interface SimuladoSummary {
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
}

export function getSimuladoSummary(userId: number): SimuladoSummary {
  const state = simuladoByUser.get(userId);
  if (!state) return { correct: 0, incorrect: 0, skipped: 0, total: 0 };

  const correct = state.results.filter((r) => r.correct === true).length;
  const incorrect = state.results.filter((r) => r.correct === false).length;
  const skipped = state.results.filter((r) => r.correct === null).length;
  return { correct, incorrect, skipped, total: state.cards.length };
}
