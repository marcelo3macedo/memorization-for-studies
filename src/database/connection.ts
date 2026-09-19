import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { initSchema } from "./schema";

const databasePath = process.env.DATABASE_PATH ?? "./data/flashgram.db";

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

initSchema(db);
