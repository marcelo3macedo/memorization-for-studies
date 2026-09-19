export interface SessionNextAction {
  type: "next";
  sessionId: number;
}

const NEXT_REGEX = /^session:(\d+):next$/;

/** Usada tanto pelo botão "Iniciar sessão" quanto pelo "Próximo" — ambos avançam para o próximo card pendente. */
export function encodeSessionNextAction(sessionId: number): string {
  return `session:${sessionId}:next`;
}

export function decodeSessionAction(data: string): SessionNextAction | null {
  const match = data.match(NEXT_REGEX);
  if (!match) return null;
  return { type: "next", sessionId: Number(match[1]) };
}
