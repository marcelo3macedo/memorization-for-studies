import type { TelegramMessage } from "../types";
import { sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";
import { ensureSession } from "../../core/sessionService";

export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text ?? "";

  if (message.from) {
    const user = syncTelegramUser(message.from);
    const { session, cards, isNew } = ensureSession(user.id);
    console.log(
      `[session] usuário ${user.id} — sessão ${session.id} ${isNew ? "criada" : "contínua"} com ${cards.length} card(s)`,
    );
  }

  console.log(`[telegram] mensagem de ${chatId}: ${text}`);

  // TODO: rotear comandos (/addcard, /decks) e texto livre, incluindo
  // respostas enviadas via reply keyboard (quick replies), que chegam
  // aqui como uma mensagem de texto comum.
  await sendMessage(chatId, `Recebido: ${text}`);
}
