import { upsertUser, type User } from "../database/usersRepository";
import type { TelegramUser } from "./types";

export function syncTelegramUser(telegramUser: TelegramUser): User {
  const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ");

  return upsertUser({
    telegramId: telegramUser.id,
    name,
    username: telegramUser.username ?? null,
  });
}
