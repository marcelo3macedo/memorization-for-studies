export type SessionAction = { type: "next"; sessionId: number } | { type: "new" };

const NEXT_REGEX = /^session:(\d+):next$/;
const NEW_DATA = "session:new";

/** Usada tanto pelo botão "Iniciar sessão" quanto pelo "Próximo" — ambos avançam para o próximo card pendente. */
export function encodeSessionNextAction(sessionId: number): string {
  return `session:${sessionId}:next`;
}

/** Botão oferecido após a sessão finalizada, para começar uma nova sem esperar a expiração da anterior. */
export function encodeSessionNewAction(): string {
  return NEW_DATA;
}

export function decodeSessionAction(data: string): SessionAction | null {
  const nextMatch = data.match(NEXT_REGEX);
  if (nextMatch) {
    return { type: "next", sessionId: Number(nextMatch[1]) };
  }

  if (data === NEW_DATA) {
    return { type: "new" };
  }

  return null;
}
