import fs from "node:fs";
import path from "node:path";
import { db } from "../connection";
import { cardExists, insertCard } from "../cardsRepository";
import type { CardSource, CardType } from "../types";
import { parseBlockAsCard, splitBlocks } from "./parseMarkdown";

const DOCS_DIR = path.resolve(process.cwd(), "docs");

const TYPE_BY_FOLDER: Record<string, CardType> = {
  "perguntas-e-respostas": "qa",
  flashcards: "flashcard",
  "perguntas-de-alternativas": "multiple_choice",
};

const SOURCES: CardSource[] = ["oficiais", "gerados"];

export interface ImportSummary {
  filesProcessed: number;
  inserted: number;
  skipped: number;
}

export function importDocs(): ImportSummary {
  const summary: ImportSummary = { filesProcessed: 0, inserted: 0, skipped: 0 };

  const runImport = db.transaction(() => {
    for (const source of SOURCES) {
      const sourceDir = path.join(DOCS_DIR, source);
      if (!fs.existsSync(sourceDir)) continue;

      for (const [folder, type] of Object.entries(TYPE_BY_FOLDER)) {
        const typeDir = path.join(sourceDir, folder);
        if (!fs.existsSync(typeDir)) continue;

        const fileNames = fs.readdirSync(typeDir).filter((name) => name.endsWith(".md"));

        for (const fileName of fileNames) {
          summary.filesProcessed += 1;

          const absolutePath = path.join(typeDir, fileName);
          const relativePath = path.relative(DOCS_DIR, absolutePath).split(path.sep).join("/");
          const content = fs.readFileSync(absolutePath, "utf-8");

          for (const block of splitBlocks(content)) {
            const parsed = parseBlockAsCard(block, type);
            if (!parsed) continue;

            if (cardExists(relativePath, parsed.title)) {
              summary.skipped += 1;
              continue;
            }

            insertCard({
              type,
              source,
              filePath: relativePath,
              title: parsed.title,
              front: parsed.front,
              back: parsed.back,
              explanation: parsed.explanation,
              alternatives: parsed.alternatives,
            });
            summary.inserted += 1;
          }
        }
      }
    }
  });

  runImport();

  return summary;
}
