import type { TelegramCallbackQuery } from "../types";
import { answerCallbackQuery, editMessageText, sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";
import { ensureSession, getNextSessionCard, registerCardInteraction } from "../../core/sessionService";
import { decodeCardAction } from "../cardActions";
import { decodeSessionAction, encodeSessionNewAction, encodeSessionNextAction } from "../sessionActions";
import { announceSession } from "../sessionMessages";
import { inlineKeyboard } from "../keyboards";
import { sendCard } from "../cardMessages";
import { getCardById } from "../../database/cardsRepository";
import { getLatestSession } from "../../database/sessionsRepository";

export async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data ?? "";

  const user = syncTelegramUser(callbackQuery.from);

  // Obrigatório: encerra o "carregando" exibido no botão do cliente.
  await answerCallbackQuery(callbackQuery.id);

  console.log(`[telegram] callback de ${callbackQuery.from.id}: ${data}`);

  if (!chatId) return;

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

  const cardAction = decodeCardAction(data);
  if (!cardAction || !messageId) return;

  const card = getCardById(cardAction.cardId);
  if (!card) {
    await editMessageText(chatId, messageId, "Este card não está mais disponível.");
    return;
  }

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
