import type { TelegramMessage } from "../types";
import { sendMessage } from "../telegramClient";
import { syncTelegramUser } from "../userSync";
import { ensureSession } from "../../core/sessionService";
import { encodeSessionNextAction } from "../sessionActions";
import { inlineKeyboard } from "../keyboards";

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

  await sendMessage(
    chatId,
    `Vamos montar uma nova sessão de estudos. Preparamos ${cards.length} card(s) para você revisar agora.`,
    {
      reply_markup: inlineKeyboard([[{ text: "🚀 Iniciar sessão", data: encodeSessionNextAction(session.id) }]]),
    },
  );
}
