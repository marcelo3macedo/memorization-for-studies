import type { Session, SessionCard } from "../database/sessionsRepository";
import { inlineKeyboard } from "./keyboards";
import { encodeSessionNextAction } from "./sessionActions";
import { sendMessage } from "./telegramClient";

/** Mensagem + botão "Iniciar sessão", reaproveitada tanto na primeira mensagem quanto ao recomeçar após o fim de uma sessão. */
export function announceSession(chatId: number, session: Session, cards: SessionCard[]) {
  return sendMessage(
    chatId,
    `Vamos montar uma nova sessão de estudos. Preparamos ${cards.length} card(s) para você revisar agora.`,
    {
      reply_markup: inlineKeyboard([[{ text: "🚀 Iniciar sessão", data: encodeSessionNextAction(session.id) }]]),
    },
  );
}
