export type CardAction =
  | { type: "reveal"; cardId: number }
  | { type: "answer"; cardId: number; label: string };

const REVEAL_REGEX = /^card:(\d+):reveal$/;
const ANSWER_REGEX = /^card:(\d+):answer:([A-Za-z])$/;

export function encodeRevealAction(cardId: number): string {
  return `card:${cardId}:reveal`;
}

export function encodeAnswerAction(cardId: number, label: string): string {
  return `card:${cardId}:answer:${label}`;
}

export function decodeCardAction(data: string): CardAction | null {
  const revealMatch = data.match(REVEAL_REGEX);
  if (revealMatch) {
    return { type: "reveal", cardId: Number(revealMatch[1]) };
  }

  const answerMatch = data.match(ANSWER_REGEX);
  if (answerMatch) {
    return { type: "answer", cardId: Number(answerMatch[1]), label: answerMatch[2].toUpperCase() };
  }

  return null;
}
