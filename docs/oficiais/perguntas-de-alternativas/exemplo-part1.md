### Pergunta
Qual estrutura de dados o SRS (Repetição Espaçada) mais se assemelha ao decidir quando revisar um card?

### Alternativas
- A) Pilha (LIFO)
- B) Fila de prioridade, ordenada pela próxima data de revisão
- C) Árvore binária de busca
- D) Tabela hash

### Resposta Correta
B

### Explicação
O SRS decide qual card revisar com base na data programada mais próxima — comportamento equivalente a uma fila de prioridade, onde o próximo item a sair é sempre o de menor "prioridade" (data mais próxima).

---

### Pergunta
Em um algoritmo de repetição espaçada, o que geralmente acontece com o intervalo até a próxima revisão quando o usuário classifica um card como "Fácil"?

### Alternativas
- A) O intervalo diminui
- B) O intervalo permanece igual
- C) O intervalo aumenta
- D) O card é removido do deck

### Resposta Correta
C

### Explicação
Uma resposta "Fácil" indica alta retenção, então o algoritmo aumenta o intervalo até a próxima revisão — o oposto ocorre quando o usuário erra ou classifica como "Difícil".
