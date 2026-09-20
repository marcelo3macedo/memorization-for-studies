### Pergunta
Explique, com suas próprias palavras, por que a Repetição Espaçada (SRS) prioriza revisar primeiro os cards que o usuário menos viu, em vez de escolher os cards de forma totalmente aleatória.

### Resposta Modelo
A Repetição Espaçada parte do princípio de que a memória se consolida por meio de revisões distribuídas ao longo do tempo, e não de exposição única ou massiva. Cards nunca vistos (ou vistos poucas vezes) representam lacunas de conhecimento ainda não reforçadas: se o sistema sorteasse os cards de forma puramente aleatória, correria o risco de repetir excessivamente conteúdos já bem consolidados enquanto conteúdos novos ou frágeis ficariam sem atenção por longos períodos. Ao priorizar os cards com menor número de visualizações, o sistema garante que todo o conteúdo disponível passe por pelo menos algumas rodadas de exposição inicial antes de entrar no ciclo normal de revisão espaçada, equilibrando a cobertura do material com o reforço da retenção de longo prazo.

---

### Pergunta
Um card do tipo discursiva é respondido em texto livre, sem alternativas prontas. Explique por que esse formato exige uma etapa adicional (avaliação por LLM) que os formatos frente/verso e pergunta/resposta não precisam.

### Resposta Modelo
Nos formatos frente/verso e pergunta/resposta, o próprio usuário compara mentalmente sua lembrança com a resposta revelada e se autoavalia (acertei, errei, foi difícil). Já no formato discursiva, a resposta não é uma alternativa fixa nem algo que se "revela" — é um texto original escrito pelo usuário, que pode estar certo com outras palavras, parcialmente certo, ou conter erros de conteúdo e de redação ao mesmo tempo. Uma comparação exata de texto (string) não seria capaz de capturar isso. Por isso é necessária uma etapa adicional de avaliação: um modelo de linguagem (LLM) recebe a pergunta, uma resposta modelo de referência e o texto do usuário, e devolve uma avaliação qualitativa do conteúdo junto com dicas de escrita, algo que somente uma análise semântica — não uma comparação literal — consegue fazer.
