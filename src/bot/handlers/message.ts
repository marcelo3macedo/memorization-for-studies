import type { Session } from "../../database/sessionsRepository";
import { getCardById } from "../../database/cardsRepository";
import { evaluateDiscursiveAnswer } from "../../core/discursiveEvaluator";
import { clearPendingDiscursiveCard, ensureSession, registerCardInteraction } from "../../core/sessionService";
import type { TelegramMessage } from "../types";
import { encodeSessionNextAction } from "../sessionActions";
import { announceSession } from "../sessionMessages";
import { inlineKeyboard } from "../keyboards";
import { sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";

export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;

  if (!message.from) return;

  const user = syncTelegramUser(message.from);
  const { session, cards, isNew } = ensureSession(user.id);

  console.log(
    `[session] usuário ${user.id} — sessão ${session.id} ${isNew ? "criada" : "contínua"} com ${cards.length} card(s)`,
  );

  if (!isNew) {
    // Sessão em andamento: se há um card discursivo aguardando resposta,
    // a mensagem de texto é a resposta a ser avaliada. Fora isso, a
    // navegação segue pelos botões.
    if (session.pendingCardId && message.text) {
      await handleDiscursiveAnswer(chatId, session, message.text);
    }
    return;
  }

  await sendMessage(chatId, `Olá, ${user.name}! 👋 Seja bem-vindo(a) ao FlashGram.`);
  await announceSession(chatId, session, cards);
}

/** Avalia a resposta em texto livre enviada para o card discursivo pendente da sessão. */
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
