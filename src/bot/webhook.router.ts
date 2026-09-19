import { Router } from "express";
import type { TelegramUpdate } from "./types";
import { handleMessage } from "./handlers/message";
import { handleCallbackQuery } from "./handlers/callbackQuery";

export const telegramWebhookRouter = Router();

telegramWebhookRouter.post("/", (req, res) => {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (webhookSecret) {
    const receivedSecret = req.header("x-telegram-bot-api-secret-token");
    if (receivedSecret !== webhookSecret) {
      res.sendStatus(401);
      return;
    }
  }

  // Responde imediatamente: o processamento roda depois, de forma
  // assíncrona, para o Telegram não reenviar o update por timeout.
  res.sendStatus(200);

  const update = req.body as TelegramUpdate;

  void (async () => {
    try {
      if (update.message) {
        await handleMessage(update.message);
      } else if (update.callback_query) {
        await handleCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error("[telegram] falha ao processar update", error);
    }
  })();
});
