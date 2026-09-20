# docs — base de dados em Markdown

Armazenamento dos flashcards em arquivos `.md`, organizados em duas camadas de pastas.

## 1º nível

* **`oficiais/`** — conteúdo revisado/curado manualmente, considerado fonte confiável.
* **`gerados/`** — conteúdo gerado automaticamente (ex.: por IA, scripts de importação), ainda não revisado.
* **`temas/`** — organização livre por assunto (crie subpastas com o nome do tema à vontade, sem estrutura fixa de 2º nível).

## 2º nível (apenas dentro de `oficiais/` e `gerados/`)

* **`perguntas-e-respostas/`** — formato pergunta/resposta (estudo mais discursivo).
* **`flashcards/`** — formato frente/verso (cartão curto, otimizado para revisão SRS).
* **`perguntas-de-alternativas/`** — formato múltipla escolha (pergunta, alternativas, resposta correta e explicação exibida em caso de erro).
* **`discursivas/`** — pergunta discursiva respondida em texto livre pelo usuário, avaliada por uma LLM (OpenAI) comparando com uma resposta modelo e devolvendo dicas de escrita.

## Arquivos

Nomeados como `<assunto>-partN.md` (ex.: `exemplo-part1.md`). Cada arquivo contém vários cards, um abaixo do outro, separados por uma linha `---` (com linha em branco antes e depois).

### Formato — `perguntas-e-respostas/`

```markdown
### Pergunta
Texto da pergunta.

### Resposta
Texto da resposta.

---

### Pergunta
Próxima pergunta.

### Resposta
Próxima resposta.
```

### Formato — `flashcards/`

```markdown
### Frente
Texto exibido primeiro.

### Verso
Texto revelado ao virar o card.

---

### Frente
Próximo card.

### Verso
Resposta do próximo card.
```

### Formato — `perguntas-de-alternativas/`

```markdown
### Pergunta
Texto da pergunta.

### Alternativas
- A) Primeira opção
- B) Segunda opção
- C) Terceira opção
- D) Quarta opção

### Resposta Correta
B

### Explicação
Texto breve exibido ao usuário quando ele erra, explicando por que a alternativa correta é essa.

---

### Pergunta
Próxima pergunta.

### Alternativas
- A) ...
- B) ...
- C) ...
- D) ...

### Resposta Correta
A

### Explicação
...
```

### Formato — `discursivas/`

```markdown
### Pergunta
Texto da pergunta.

### Resposta Modelo
Resposta de referência usada pela LLM para avaliar o texto enviado pelo usuário.

---

### Pergunta
Próxima pergunta.

### Resposta Modelo
Próxima resposta de referência.
```

Ao responder um card desse tipo pelo bot, o usuário digita a resposta como
mensagem de texto livre; ela é enviada para a OpenAI (variável `OPENAI_KEY`),
que compara com a `Resposta Modelo` e devolve uma avaliação de conteúdo mais
dicas de escrita no nível mais fácil possível.

Veja `exemplo-part1.md` em cada pasta para um exemplo completo.
