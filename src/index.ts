import "dotenv/config";
import express from "express";
import { db } from "./database/connection";
import { telegramWebhookRouter } from "./bot/webhook.router";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  const { result } = db.prepare("SELECT 1 AS result").get() as { result: number };
  res.json({ status: "ok", database: result === 1 ? "connected" : "error" });
});

app.use("/webhook/telegram", telegramWebhookRouter);

app.listen(port, () => {
  console.log(`FlashGram server listening on port ${port}`);
});
