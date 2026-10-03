import type { Session } from "../../database/sessionsRepository";
import { getCardById } from "../../database/cardsRepository";
import { evaluateDiscursiveAnswer } from "../../core/discursiveEvaluator";
import { clearPendingDiscursiveCard, ensureSession, registerCardInteraction } from "../../core/sessionService";
import {
  clearSimulado,
  clearSimuladoPendingCard,
  getSimuladoState,
  recordSimuladoResult,
  type SimuladoState,
} from "../simuladoService";
import type { TelegramMessage } from "../types";
import { encodeSessionNextAction } from "../sessionActions";
import { encodeSimuladoNextAction } from "../simuladoActions";
import { announceSession } from "../sessionMessages";
import { inlineKeyboard } from "../keyboards";
import { sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";

export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;

  if (!message.from) return;

  const user = syncTelegramUser(message.from);

  // "sair" funciona a qualquer momento: limpa o simulado e volta ao início
  if (message.text?.toLowerCase().trim() === "sair") {
    clearSimulado(user.id);
    const { session, cards } = ensureSession(user.id);
    await announceSession(chatId, session, cards);
    return;
  }

  // Se o usuário está em simulado, processar resposta discursiva pendente
  const simuladoState = getSimuladoState(user.id);
  if (simuladoState) {
    if (simuladoState.pendingCardId && message.text) {
      await handleSimuladoDiscursiveAnswer(chatId, user.id, simuladoState, message.text);
    }
    return;
  }

  const { session, cards, isNew } = ensureSession(user.id);

  console.log(
    `[session] usuário ${user.id} — sessão ${session.id} ${isNew ? "criada" : "contínua"} com ${cards.length} card(s)`,
  );

  if (!isNew) {
    if (session.pendingCardId && message.text) {
      await handleDiscursiveAnswer(chatId, session, message.text);
    }
    return;
  }

  await sendMessage(chatId, `Olá, ${user.name}! 👋 Seja bem-vindo(a) ao FlashGram.`);
  await announceSession(chatId, session, cards);
}

async function handleDiscursiveAnswer(chatId: number, session: Session, userAnswer: string): Promise<void> {
  const cardId = session.pendingCardId;
  if (!cardId) return;

  const card = getCardById(cardId);
  clearPendingDiscursiveCard(session.id);

  if (!card) return;

  const feedback = await evaluateDiscursiveAnswer({
    question: card.front,
    modelAnswer: card.back ?? "",
    userAnswer,
  });

  registerCardInteraction(session.userId, card.id);

  await sendMessage(chatId, feedback, {
    reply_markup: inlineKeyboard([[{ text: "➡️ Próximo", data: encodeSessionNextAction(session.id) }]]),
  });
}

async function handleSimuladoDiscursiveAnswer(
  chatId: number,
  userId: number,
  state: SimuladoState,
  userAnswer: string,
): Promise<void> {
  const cardId = state.pendingCardId;
  if (!cardId) return;

  const card = getCardById(cardId);
  clearSimuladoPendingCard(userId);

  if (!card) return;

  const feedback = await evaluateDiscursiveAnswer({
    question: card.front,
    modelAnswer: card.back ?? "",
    userAnswer,
  });

  const isCorrect = parseDiscursiveResult(feedback);
  recordSimuladoResult(userId, card.id, isCorrect);

  await sendMessage(chatId, feedback, {
    reply_markup: inlineKeyboard([[{ text: "➡️ Próxima questão", data: encodeSimuladoNextAction() }]]),
  });
}

/** Interpreta o feedback do avaliador para saber se a resposta foi boa (Ótima/Boa) ou ruim (Regular/Fraca). */
function parseDiscursiveResult(feedback: string): boolean | null {
  const match = feedback.match(/Avalia[cç][aã]o:\s*(Ótima|Boa|Regular|Fraca)/i);
  if (!match) return null;
  return match[1] === "Ótima" || match[1] === "Boa";
}
