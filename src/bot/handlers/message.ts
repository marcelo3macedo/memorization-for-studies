import type { TelegramMessage } from "../types";
import { sendMessage } from "../telegramClient";

export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text ?? "";

  console.log(`[telegram] mensagem de ${chatId}: ${text}`);

  // TODO: rotear comandos (/addcard, /decks) e texto livre, incluindo
  // respostas enviadas via reply keyboard (quick replies), que chegam
  // aqui como uma mensagem de texto comum.
  await sendMessage(chatId, `Recebido: ${text}`);
}
