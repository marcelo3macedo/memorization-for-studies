import type { CardAlternative, CardType } from "../types";

export interface ParsedCard {
  title: string;
  front: string;
  back: string | null;
  explanation: string | null;
  alternatives: CardAlternative[];
}

export function splitBlocks(content: string): string[] {
  return content
    .split(/^---$/m)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

function parseSections(block: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const headingRegex = /^### (.+)$/gm;
  const matches = [...block.matchAll(headingRegex)];

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : block.length;
    sections[heading] = block.slice(start, end).trim();
  }

  return sections;
}

function parseAlternatives(raw: string, correctLabel: string): CardAlternative[] {
  const itemRegex = /^-\s*([A-Za-z])\)\s*(.+)$/;

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const match = line.match(itemRegex);
      if (!match) return [];
      const [, label, text] = match;
      return [
        {
          label: label.toUpperCase(),
          text: text.trim(),
          isCorrect: label.toUpperCase() === correctLabel.toUpperCase(),
        },
      ];
    });
}

export function parseBlockAsCard(block: string, type: CardType): ParsedCard | null {
  const sections = parseSections(block);

  if (type === "qa") {
    if (!sections["Pergunta"] || !sections["Resposta"]) return null;
    return {
      title: sections["Pergunta"],
      front: sections["Pergunta"],
      back: sections["Resposta"],
      explanation: null,
      alternatives: [],
    };
  }

  if (type === "flashcard") {
    if (!sections["Frente"] || !sections["Verso"]) return null;
    return {
      title: sections["Frente"],
      front: sections["Frente"],
      back: sections["Verso"],
      explanation: null,
      alternatives: [],
    };
  }

  if (type === "discursive") {
    if (!sections["Pergunta"] || !sections["Resposta Modelo"]) return null;
    return {
      title: sections["Pergunta"],
      front: sections["Pergunta"],
      back: sections["Resposta Modelo"],
      explanation: null,
      alternatives: [],
    };
  }

  // multiple_choice
  const correct = sections["Resposta Correta"];
  if (!sections["Pergunta"] || !sections["Alternativas"] || !correct) return null;

  return {
    title: sections["Pergunta"],
    front: sections["Pergunta"],
    back: null,
    explanation: sections["Explicação"] ?? null,
    alternatives: parseAlternatives(sections["Alternativas"], correct.trim()),
  };
}
