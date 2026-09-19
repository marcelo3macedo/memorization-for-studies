# 🧠 FlashGram

> Sistema inteligente de memorização para estudos com **Repetição Espaçada (SRS)** integrado diretamente ao **Telegram**, desenvolvido em **Node.js 22** e **SQLite**.

---

## 📌 Sobre o Projeto

O **FlashGram** transforma o Telegram em uma plataforma ativa de revisões. Em vez de depender da abertura manual de aplicativos de estudo (como o Anki), o usuário recebe seus flashcards diretamente no chat em horários programados, responde pelo próprio aplicativo e visualiza seu progresso em tempo real.

---

## ✨ Funcionalidades

* **Notificações Proativas:** Envio de cards pendentes com base no cronograma de revisões.
* **Repetição Espaçada (SRS):** Cálculo dinâmico de intervalos de estudo (1 dia, 3 dias, 7 dias...) ajustado de acordo com o nível de retenção do usuário.
* **Botoes Interativos via Telegram:**
  * Revelar resposta com um clique.
  * Classificação rápida: *Errei*, *Difícil*, *Bom*, *Fácil*.
* **Gerenciamento de Decks e Cards:**
  * Criação, edição e exclusão de cards via comandos `/addcard` e `/decks`.
  * Suporte a texto formatado (Markdown/HTML), imagens e código.
* **Estatísticas e Métricas:** Acompanhamento de sequência diária (*streak*), taxa de acerto e quantidade de cards a revisar.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js 22 (LTS)
* **Framework do Bot:** `grammY` (ou `telegraf`)
* **Banco de Dados:** SQLite (com `better-sqlite3` ou Prisma)
* **Agendamento:** `node-cron`
* **Linguagem:** TypeScript / JavaScript

---

## 📂 Estrutura do Repositório

```text
├── src/
│   ├── bot/          # Handlers, menus e comandos do Telegram
│   ├── core/         # Lógica do algoritmo de Repetição Espaçada (SRS)
│   ├── database/     # Conexão, schemas e queries do SQLite
│   ├── scheduler/    # Agendamento das notificações de revisão
│   └── index.ts      # Ponto de entrada da aplicação
├── data/             # Diretório onde o arquivo SQLite (.db) é armazenado
├── .env.example      # Exemplo das variáveis de ambiente
├── package.json      # Dependências e scripts do Node.js
└── README.md         # Documentação do projeto