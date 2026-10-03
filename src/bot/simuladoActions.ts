export type SimuladoAction = { type: "start" } | { type: "next" };

const START_DATA = "simulado:start";
const NEXT_DATA = "simulado:next";

export function encodeSimuladoStartAction(): string {
  return START_DATA;
}

export function encodeSimuladoNextAction(): string {
  return NEXT_DATA;
}

export function decodeSimuladoAction(data: string): SimuladoAction | null {
  if (data === START_DATA) return { type: "start" };
  if (data === NEXT_DATA) return { type: "next" };
  return null;
}
