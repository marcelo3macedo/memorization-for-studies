# Agente de Conteúdo — docs/ (Flashcards)

Instruções para o agente responsável por criar e manter os arquivos Markdown
de flashcards em `docs/`. Esses arquivos são a fonte de dados: o importador
em `src/database/importer/` os lê e grava no SQLite (tabelas `cards` e
`card_alternatives`). Siga este documento à risca — o parser é estrito e
não tolera desvios de formato.

## 1. Estrutura de pastas

```
docs/
├── oficiais/
│   ├── perguntas-e-respostas/
│   ├── flashcards/
│   ├── perguntas-de-alternativas/
│   └── discursivas/
├── gerados/
│   ├── perguntas-e-respostas/
│   ├── flashcards/
│   ├── perguntas-de-alternativas/
│   └── discursivas/
└── temas/          (organização livre, sem 2º nível fixo)
```

### `oficiais/` vs `gerados/`

- **`oficiais/`** — conteúdo já revisado por um humano, considerado fonte confiável.
- **`gerados/`** — conteúdo gerado automaticamente (por você, agente, ou por script).

**Regra:** todo conteúdo novo que você criar vai em **`gerados/`**. Nunca grave
diretamente em `oficiais/` — mover algo de `gerados/` para `oficiais/` é uma
decisão humana, de revisão.

### `temas/`

Pasta livre, sem estrutura de 2º nível fixa e **não lida pelo importador**
(hoje só `oficiais/` e `gerados/` são processados). Use para notas de
estudo soltas que não sejam cards estruturados, organizando por subpastas
de assunto à vontade.

## 2. Tipos de card (2º nível de `oficiais/` e `gerados/`)

| Pasta | Quando usar |
|---|---|
| `perguntas-e-respostas/` | Pergunta com resposta pronta, mais longa/explicativa — o usuário só revela e confere. |
| `flashcards/` | Par curto frente/verso, revisão rápida (termo → definição). |
| `perguntas-de-alternativas/` | Múltipla escolha (estilo prova/concurso), com explicação para o erro. |
| `discursivas/` | Pergunta dissertativa que o usuário responde **digitando um texto livre**, avaliado por uma LLM (OpenAI) contra uma resposta modelo. |

## 3. Nomenclatura de arquivo

`<assunto-em-kebab-case>-partN.md`, por exemplo `seguranca-da-informacao-part1.md`.

- Um arquivo por assunto. Se ficar muito grande (guia prático: mais de ~20
  cards), crie `-part2.md`, `-part3.md` etc. para o mesmo assunto, em vez de
  um único arquivo enorme.
- Nunca reaproveite o nome de um arquivo já existente para outro assunto.

## 4. Formato de cada card

Cada arquivo contém vários cards, um abaixo do outro, **separados por uma
linha contendo exatamente `---`** (nada mais na linha), com uma linha em
branco antes e depois dela.

Os títulos das seções (`### Pergunta`, `### Frente` etc.) precisam ser
**exatamente** estes textos — maiúsculas, minúsculas e acentos importam,
o parser faz correspondência exata.

### `perguntas-e-respostas/`

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

### `flashcards/`

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

### `perguntas-de-alternativas/`

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
Texto breve exibido ao usuário quando ele erra, explicando por que a
alternativa correta é essa.

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

Regras específicas deste tipo:
- Cada alternativa é uma linha `- <LETRA>) <texto>` (traço, espaço, uma
  letra, parêntese fechando, espaço, texto). O parser usa essa regex exata:
  `^-\s*([A-Za-z])\)\s*(.+)$`.
- `### Resposta Correta` contém **só a letra** (ex.: `B`), nada mais na seção.
- `### Explicação` é obrigatória — é o texto mostrado quando o usuário erra.

Exemplos completos e reais já existem em `docs/oficiais/*/exemplo-part1.md`
e `docs/gerados/*/seguranca-da-informacao-part1.md`.

### `discursivas/`

```markdown
### Pergunta
Texto da pergunta dissertativa.

### Resposta Modelo
Resposta de referência, completa e tecnicamente precisa — é o que a LLM usa
para avaliar o que o usuário escrever, não é mostrada a ele como gabarito.

---

### Pergunta
Próxima pergunta.

### Resposta Modelo
Próxima resposta de referência.
```

Regras específicas deste tipo:
- `### Resposta Modelo` vai para a coluna `back` do card, exatamente como em
  `perguntas-e-respostas/`, mas o significado é diferente: é material de
  referência para a avaliação automática, não uma resposta a ser revelada.
  Escreva-a como um bom padrão de resposta de concurso — completa, correta,
  organizada em tópicos quando fizer sentido (veja o nível de detalhe usado
  em `docs/oficiais/perguntas-e-respostas/*.md` para o mesmo assunto).
- No bot, o card é apresentado só com a pergunta; o usuário responde digitando
  um texto livre (sem botões). A resposta é enviada para a OpenAI
  (`OPENAI_KEY` no `.env`, ver `src/core/discursiveEvaluator.ts`), que compara
  com a `Resposta Modelo` e devolve uma avaliação de conteúdo mais dicas de
  escrita no nível mais fácil possível — não é preciso (nem incentivado)
  escrever essas dicas manualmente no arquivo `.md`, elas são geradas na hora.
- Pergunta deve ser autocontida (o usuário não vê a Resposta Modelo antes de
  responder), então evite perguntas que dependam de contexto externo ao
  próprio enunciado.

## 5. Regra de deduplicação — MUITO IMPORTANTE

O importador (`npm run import:docs`) controla duplicidade pela combinação
**(caminho do arquivo relativo a `docs/`) + (texto exato de `Pergunta`/`Frente`)**.
Isso tem duas consequências diretas para como você deve editar:

1. **Adicionar um card novo a um arquivo existente é seguro** — só o card
   novo entra no banco, os demais são ignorados por já existirem.
2. **Editar o texto de uma `Pergunta`/`Frente` já importada NÃO atualiza o
   card existente** — o importador não reconhece a ligação e cria um
   registro duplicado no banco, com o texto antigo intacto. **Nunca altere
   o texto de uma Pergunta/Frente que já foi importada anteriormente.** Se
   um card já publicado precisar de correção, sinalize isso explicitamente
   (não edite silenciosamente) para que a correção seja feita também no
   banco.

## 6. Fluxo de trabalho ao criar conteúdo novo

1. Defina o tema e o(s) tipo(s) de card mais adequado(s) (pode gerar os três
   tipos para o mesmo tema, em arquivos separados).
2. Crie ou complemente o arquivo em `docs/gerados/<tipo>/<assunto>-partN.md`
   seguindo os templates da seção 4 exatamente.
3. Rode `npm run import:docs` e confira o resumo impresso — ele mostra
   quantos cards foram **inseridos** (novos) e quantos foram **ignorados**
   (já existentes). Se você esperava cards novos e a contagem de inseridos
   veio zero, revise os cabeçalhos e o separador `---` antes de qualquer
   outra coisa.
4. Não é necessário (nem recomendado) editar o banco SQLite diretamente —
   todo o fluxo de entrada de conteúdo passa pelos arquivos `.md`.
