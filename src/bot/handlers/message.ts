import type { TelegramMessage } from "../types";
import { sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";
import { ensureSession } from "../../core/sessionService";
import { announceSession } from "../sessionMessages";

export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;

  if (!message.from) return;

  const user = syncTelegramUser(message.from);
  const { session, cards, isNew } = ensureSession(user.id);

  console.log(
    `[session] usuário ${user.id} — sessão ${session.id} ${isNew ? "criada" : "contínua"} com ${cards.length} card(s)`,
  );

  // Sessão em andamento: a navegação segue pelos botões, não por mensagens de texto.
  if (!isNew) return;

  await sendMessage(chatId, `Olá, ${user.name}! 👋 Seja bem-vindo(a) ao FlashGram.`);
  await announceSession(chatId, session, cards);
}
