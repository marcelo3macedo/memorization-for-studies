import { createChatCompletion } from "../services/openaiClient";

export interface DiscursiveEvaluationInput {
  question: string;
  modelAnswer: string;
  userAnswer: string;
}

const SYSTEM_PROMPT = `Você é um avaliador de respostas discursivas para concursos públicos brasileiros.
Compare a resposta do candidato com a resposta modelo fornecida e avalie tanto o CONTEÚDO (precisão técnica e completude) quanto a ESCRITA (clareza, organização, objetividade).

Responda SEMPRE em português, seguindo EXATAMENTE este formato (sem markdown de código, sem texto fora dele):
📊 Avaliação: <Ótima|Boa|Regular|Fraca>
💬 Comentário: <um parágrafo curto e direto sobre o conteúdo da resposta>
✍️ Dicas de escrita (nível iniciante):
- <dica 1, simples e prática>
- <dica 2, simples e prática>
- <dica 3, simples e prática (opcional)>

As dicas de escrita devem ser no nível mais fácil possível, como se estivesse ensinando alguém que
está começando agora a escrever respostas dissertativas: evite jargão de banca examinadora, use
frases curtas e ações concretas (ex.: "comece pela ideia principal", "separe em parágrafos por
assunto", "evite repetir a pergunta antes de responder").`;

function buildUserPrompt(input: DiscursiveEvaluationInput): string {
  return [
    `Pergunta:\n${input.question}`,
    `Resposta modelo (referência interna para avaliação, não é a única forma correta de responder):\n${input.modelAnswer}`,
    `Resposta do candidato:\n${input.userAnswer}`,
  ].join("\n\n");
}

function fallbackFeedback(input: DiscursiveEvaluationInput): string {
  return [
    "⚠️ Não consegui avaliar sua resposta automaticamente agora.",
    "",
    "Resposta modelo para comparação:",
    input.modelAnswer,
    "",
    "✍️ Dica geral de escrita: comece pela ideia principal, separe o texto em parágrafos curtos " +
      "(um assunto por parágrafo) e evite repetir a pergunta antes de responder.",
  ].join("\n");
}

/** Avalia a resposta discursiva do usuário via LLM, com fallback textual se a chamada falhar. */
export async function evaluateDiscursiveAnswer(input: DiscursiveEvaluationInput): Promise<string> {
  try {
    return await createChatCompletion([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ]);
  } catch (error) {
    console.error("[discursiveEvaluator] falha ao avaliar resposta via OpenAI", error);
    return fallbackFeedback(input);
  }
}
