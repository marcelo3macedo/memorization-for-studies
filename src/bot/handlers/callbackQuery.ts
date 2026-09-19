import type { TelegramCallbackQuery } from "../types";
import { answerCallbackQuery, sendMessage } from "../telegramClient";

export async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  const data = callbackQuery.data ?? "";

  console.log(`[telegram] callback de ${callbackQuery.from.id}: ${data}`);

  // Obrigatório: encerra o "carregando" exibido no botão do cliente.
  await answerCallbackQuery(callbackQuery.id);

  // TODO: rotear ações dos botões inline (revelar resposta, classificar
  // card: Errei / Difícil / Bom / Fácil).
  if (chatId) {
    await sendMessage(chatId, `Ação recebida: ${data}`);
  }
}
