import type { TelegramCallbackQuery } from "../types";
import { answerCallbackQuery, editMessageText, sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";
import { ensureSession, getNextSessionCard, registerCardInteraction } from "../../core/sessionService";
import { decodeCardAction } from "../cardActions";
import { encodeAnswerAction, encodeRevealAction } from "../cardActions";
import { decodeSessionAction, encodeSessionNewAction, encodeSessionNextAction } from "../sessionActions";
import { decodeSimuladoAction, encodeSimuladoNextAction, encodeSimuladoStartAction } from "../simuladoActions";
import {
  advanceSimulado,
  clearSimulado,
  getSimuladoState,
  getSimuladoSummary,
  recordSimuladoResult,
  setSimuladoPendingCard,
  startSimulado,
} from "../simuladoService";
import { announceSession } from "../sessionMessages";
import { inlineKeyboard } from "../keyboards";
import { sendCard } from "../cardMessages";
import { getCardById } from "../../database/cardsRepository";
import { getLatestSession } from "../../database/sessionsRepository";
import type { Card } from "../../database/types";
import type { CardAction } from "../cardActions";

export async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data ?? "";

  const user = syncTelegramUser(callbackQuery.from);

  await answerCallbackQuery(callbackQuery.id);

  console.log(`[telegram] callback de ${callbackQuery.from.id}: ${data}`);

  if (!chatId) return;

  // --- Ações de simulado ---
  const simuladoAction = decodeSimuladoAction(data);
  if (simuladoAction?.type === "start") {
    await handleSimuladoStart(chatId, user.id);
    return;
  }
  if (simuladoAction?.type === "next") {
    await handleSimuladoNext(chatId, user.id);
    return;
  }

  // --- Ações de sessão normal ---
  const sessionAction = decodeSessionAction(data);
  if (sessionAction?.type === "next") {
    await advanceSession(chatId, sessionAction.sessionId);
    return;
  }
  if (sessionAction?.type === "new") {
    const { session, cards } = ensureSession(user.id);
    await announceSession(chatId, session, cards);
    return;
  }

  // --- Ações de card (usadas em ambos os modos) ---
  const cardAction = decodeCardAction(data);
  if (!cardAction || !messageId) return;

  const card = getCardById(cardAction.cardId);
  if (!card) {
    await editMessageText(chatId, messageId, "Este card não está mais disponível.");
    return;
  }

  // Se o usuário está em simulado, registrar resultado no simulado
  const simuladoState = getSimuladoState(user.id);
  if (simuladoState) {
    await handleSimuladoCardAction(chatId, messageId, user.id, card, cardAction);
    return;
  }

  // Modo sessão normal
  registerCardInteraction(user.id, card.id);

  const session = getLatestSession(user.id);
  const nextButton = session
    ? inlineKeyboard([[{ text: "➡️ Próximo", data: encodeSessionNextAction(session.id) }]])
    : undefined;

  if (cardAction.type === "reveal") {
    await editMessageText(chatId, messageId, `${card.front}\n\n${card.back ?? ""}`, {
      reply_markup: nextButton,
    });
    return;
  }

  const chosen = card.alternatives.find((alt) => alt.label === cardAction.label);
  const correct = card.alternatives.find((alt) => alt.isCorrect);
  const isCorrect = chosen?.isCorrect ?? false;

  const resultLines = [card.front, "", `Você respondeu: ${cardAction.label}) ${chosen?.text ?? ""}`, ""];

  if (isCorrect) {
    resultLines.push("✅ Resposta correta!");
  } else {
    resultLines.push(`❌ Resposta incorreta. Correta: ${correct?.label}) ${correct?.text ?? ""}`);
    if (card.explanation) {
      resultLines.push("", `Explicação: ${card.explanation}`);
    }
  }

  await editMessageText(chatId, messageId, resultLines.join("\n"), { reply_markup: nextButton });
}

async function advanceSession(chatId: number, sessionId: number): Promise<void> {
  const { sessionCard, totalCards } = getNextSessionCard(sessionId);

  if (!sessionCard) {
    await sendMessage(chatId, `🎉 Sessão finalizada! Você revisou ${totalCards} card(s). Até a próxima!`);
    await sendMessage(chatId, "Deseja iniciar uma nova sessão agora?", {
      reply_markup: inlineKeyboard([[{ text: "🔄 Iniciar nova sessão", data: encodeSessionNewAction() }]]),
    });
    return;
  }

  const card = getCardById(sessionCard.cardId);
  if (!card) return;

  await sendCard(chatId, card, sessionId);
}

// ---------------------------------------------------------------------------
// Simulado
// ---------------------------------------------------------------------------

async function handleSimuladoStart(chatId: number, userId: number): Promise<void> {
  const state = startSimulado(userId);

  if (state.cards.length === 0) {
    await sendMessage(chatId, "Não há cards disponíveis para o modo simulado.");
    return;
  }

  const card = state.cards[0];
  await sendMessage(
    chatId,
    `🧪 Modo Simulado iniciado! ${state.cards.length} questões selecionadas aleatoriamente.\n\nDigite "sair" a qualquer momento para voltar ao início.`,
  );
  await sendSimuladoCard(chatId, userId, card, 1, state.cards.length);
}

async function handleSimuladoNext(chatId: number, userId: number): Promise<void> {
  const { card, current, total } = advanceSimulado(userId);

  if (!card) {
    const summary = getSimuladoSummary(userId);
    clearSimulado(userId);

    const scored = summary.total - summary.skipped;
    const pct = scored > 0 ? Math.round((summary.correct / scored) * 100) : 0;

    const summaryLines = [
      `🏁 Simulado finalizado!`,
      ``,
      `📊 Resultado — ${summary.total} questão(ões):`,
      `✅ Acertos: ${summary.correct}`,
      `❌ Erros: ${summary.incorrect}`,
    ];
    if (summary.skipped > 0) {
      summaryLines.push(`👁 Reveladas (sem pontuação): ${summary.skipped}`);
    }
    if (scored > 0) {
      summaryLines.push(``, `📈 Aproveitamento: ${pct}%`);
    }

    await sendMessage(chatId, summaryLines.join("\n"));

    const { session, cards } = ensureSession(userId);
    await announceSession(chatId, session, cards);
    return;
  }

  await sendSimuladoCard(chatId, userId, card, current, total);
}

async function handleSimuladoCardAction(
  chatId: number,
  messageId: number,
  userId: number,
  card: Card,
  action: CardAction,
): Promise<void> {
  const nextButton = inlineKeyboard([[{ text: "➡️ Próxima questão", data: encodeSimuladoNextAction() }]]);

  if (action.type === "reveal") {
    recordSimuladoResult(userId, card.id, null);
    await editMessageText(chatId, messageId, `${card.front}\n\n${card.back ?? ""}`, {
      reply_markup: nextButton,
    });
    return;
  }

  const chosen = card.alternatives.find((alt) => alt.label === action.label);
  const correct = card.alternatives.find((alt) => alt.isCorrect);
  const isCorrect = chosen?.isCorrect ?? false;

  recordSimuladoResult(userId, card.id, isCorrect);

  const resultLines = [card.front, "", `Você respondeu: ${action.label}) ${chosen?.text ?? ""}`, ""];

  if (isCorrect) {
    resultLines.push("✅ Resposta correta!");
  } else {
    resultLines.push(`❌ Resposta incorreta. Correta: ${correct?.label}) ${correct?.text ?? ""}`);
    if (card.explanation) {
      resultLines.push("", `Explicação: ${card.explanation}`);
    }
  }

  await editMessageText(chatId, messageId, resultLines.join("\n"), { reply_markup: nextButton });
}

async function sendSimuladoCard(
  chatId: number,
  userId: number,
  card: Card,
  current: number,
  total: number,
): Promise<void> {
  const header = `📝 Questão ${current}/${total}\n\n`;

  if (card.type === "multiple_choice") {
    const alternativesText = card.alternatives.map((alt) => `${alt.label}) ${alt.text}`).join("\n");
    const buttons = card.alternatives.map((alt) => ({
      text: alt.label,
      data: encodeAnswerAction(card.id, alt.label),
    }));
    await sendMessage(chatId, `${header}${card.front}\n\n${alternativesText}`, {
      reply_markup: inlineKeyboard([buttons]),
    });
    return;
  }

  if (card.type === "discursive") {
    setSimuladoPendingCard(userId, card.id);
    await sendMessage(chatId, `${header}${card.front}\n\n✍️ Envie sua resposta em uma mensagem de texto.`);
    return;
  }

  // flashcard / qa — botão de revelação
  const buttonLabel = card.type === "flashcard" ? "Revelar" : "Revelar resposta";
  await sendMessage(chatId, `${header}${card.front}`, {
    reply_markup: inlineKeyboard([[{ text: buttonLabel, data: encodeRevealAction(card.id) }]]),
  });
}
