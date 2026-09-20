export type CardType = "qa" | "flashcard" | "multiple_choice" | "discursive";
export type CardSource = "oficiais" | "gerados";

export interface CardAlternative {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface Card {
  id: number;
  type: CardType;
  source: CardSource;
  filePath: string;
  title: string;
  front: string;
  back: string | null;
  explanation: string | null;
  createdAt: string;
  alternatives: CardAlternative[];
}
