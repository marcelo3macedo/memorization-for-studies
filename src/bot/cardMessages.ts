import { markPendingDiscursiveCard } from "../core/sessionService";
import type { Card } from "../database/types";
import { encodeAnswerAction, encodeRevealAction } from "./cardActions";
import { inlineKeyboard } from "./keyboards";
import { sendMessage } from "./telegramClient";

/**
 * Envia um card ao chat, escolhendo o formato de mensagem conforme o tipo.
 * `sessionId` é obrigatório para cards discursivos: marca a sessão como
 * aguardando a resposta em texto livre do usuário para esse card.
 */
export function sendCard(chatId: number, card: Card, sessionId?: number) {
  if (card.type === "multiple_choice") {
    return sendMultipleChoiceCard(chatId, card);
  }
  if (card.type === "discursive") {
    return sendDiscursiveCard(chatId, card, sessionId);
  }
  return sendRevealCard(chatId, card);
}

/** flashcard (Frente/Verso) e qa (Pergunta/Resposta): mostra a frente com um botão único de ação. */
function sendRevealCard(chatId: number, card: Card) {
  const buttonLabel = card.type === "flashcard" ? "Revelar" : "Revelar resposta";

  return sendMessage(chatId, card.front, {
    reply_markup: inlineKeyboard([[{ text: buttonLabel, data: encodeRevealAction(card.id) }]]),
  });
}

/** perguntas-de-alternativas: mostra a pergunta e as opções, com botões simples A, B, C, D. */
function sendMultipleChoiceCard(chatId: number, card: Card) {
  const alternativesText = card.alternatives.map((alt) => `${alt.label}) ${alt.text}`).join("\n");
  const text = `${card.front}\n\n${alternativesText}`;

  const buttons = card.alternatives.map((alt) => ({
    text: alt.label,
    data: encodeAnswerAction(card.id, alt.label),
  }));

  return sendMessage(chatId, text, {
    reply_markup: inlineKeyboard([buttons]),
  });
}

/** discursivas: mostra a pergunta e pede que a resposta seja enviada como mensagem de texto livre. */
function sendDiscursiveCard(chatId: number, card: Card, sessionId?: number) {
  if (sessionId) {
    markPendingDiscursiveCard(sessionId, card.id);
  }

  return sendMessage(chatId, `${card.front}\n\n✍️ Envie sua resposta em uma mensagem de texto.`);
}
