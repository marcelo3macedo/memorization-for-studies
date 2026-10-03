import type { Session, SessionCard } from "../database/sessionsRepository";
import { inlineKeyboard } from "./keyboards";
import { encodeSessionNextAction } from "./sessionActions";
import { encodeSimuladoStartAction } from "./simuladoActions";
import { sendMessage } from "./telegramClient";

/** Mensagem + botões de início: sessão normal ou modo simulado. Reaproveitada na primeira mensagem e após fim de sessão/simulado. */
export function announceSession(chatId: number, session: Session, cards: SessionCard[]) {
  return sendMessage(
    chatId,
    `O que deseja fazer? Preparamos ${cards.length} card(s) para a sessão normal.`,
    {
      reply_markup: inlineKeyboard([
        [{ text: "🚀 Iniciar sessão", data: encodeSessionNextAction(session.id) }],
        [{ text: "🧪 Modo simulado (20 questões aleatórias)", data: encodeSimuladoStartAction() }],
      ]),
    },
  );
}
