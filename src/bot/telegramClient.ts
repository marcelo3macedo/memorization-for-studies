const TELEGRAM_API_BASE = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN não configurado");
  }
  return token;
}

async function callTelegramApi<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  const url = `${TELEGRAM_API_BASE}/bot${getBotToken()}/${method}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { ok: boolean; result: T; description?: string };

  if (!data.ok) {
    throw new Error(`Telegram API error on ${method}: ${data.description}`);
  }

  return data.result;
}

export function sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return callTelegramApi("sendMessage", { chat_id: chatId, text, ...extra });
}

export function answerCallbackQuery(callbackQueryId: string, extra: Record<string, unknown> = {}) {
  return callTelegramApi("answerCallbackQuery", { callback_query_id: callbackQueryId, ...extra });
}

export function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  extra: Record<string, unknown> = {},
) {
  return callTelegramApi("editMessageText", { chat_id: chatId, message_id: messageId, text, ...extra });
}
