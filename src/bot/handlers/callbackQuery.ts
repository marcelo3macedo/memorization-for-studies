import type { TelegramCallbackQuery } from "../types";
import { answerCallbackQuery, sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";
import { registerCardInteraction } from "../../core/sessionService";

// Convenção do callback_data dos botões de review: "card:<cardId>:<avaliacao>"
// (ex.: "card:42:facil"), usada para os botões Errei/Difícil/Bom/Fácil.
const CARD_INTERACTION_REGEX = /^card:(\d+):(.+)$/;

export async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  const data = callbackQuery.data ?? "";

  const user = syncTelegramUser(callbackQuery.from);

  const match = data.match(CARD_INTERACTION_REGEX);
  if (match) {
    const cardId = Number(match[1]);
    registerCardInteraction(user.id, cardId);
  }

  console.log(`[telegram] callback de ${callbackQuery.from.id}: ${data}`);

  // Obrigatório: encerra o "carregando" exibido no botão do cliente.
  await answerCallbackQuery(callbackQuery.id);

  // TODO: rotear ações dos botões inline (revelar resposta, classificar
  // card: Errei / Difícil / Bom / Fácil).
  if (chatId) {
    await sendMessage(chatId, `Ação recebida: ${data}`);
  }
}
