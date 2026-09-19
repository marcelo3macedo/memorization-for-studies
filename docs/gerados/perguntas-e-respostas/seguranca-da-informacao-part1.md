### Pergunta
Quais são os três princípios (pilares) clássicos da Segurança da Informação, conhecidos pela sigla CID (ou CIA, em inglês)?

### Resposta
Confidencialidade (garantir que a informação só seja acessada por quem tem autorização), Integridade (garantir que a informação não seja alterada de forma indevida ou não autorizada) e Disponibilidade (garantir que a informação esteja acessível sempre que necessário para quem tem direito de acesso).

---

### Pergunta
Além de Confidencialidade, Integridade e Disponibilidade, quais outros dois princípios são frequentemente cobrados em provas de concurso (formando o modelo estendido)?

### Resposta
Autenticidade (garantir que a origem da informação é realmente quem afirma ser) e Irretratabilidade/Não-repúdio (garantir que o autor de uma ação não possa negar tê-la praticado, geralmente assegurado por assinatura digital).

---

### Pergunta
Qual a diferença entre criptografia simétrica e criptografia assimétrica?

### Resposta
Na criptografia simétrica, a mesma chave é usada para cifrar e decifrar a mensagem, sendo mais rápida, mas exigindo compartilhamento seguro da chave (ex.: AES, DES). Na criptografia assimétrica, são usadas duas chaves distintas e matematicamente relacionadas — uma pública (para cifrar ou verificar) e uma privada (para decifrar ou assinar) —, sendo mais lenta, porém dispensando o compartilhamento de segredo (ex.: RSA).

---

### Pergunta
O que é uma função hash e por que ela não é considerada criptografia (no sentido de cifrar/decifrar)?

### Resposta
Função hash é um algoritmo que transforma uma entrada de tamanho variável em uma saída de tamanho fixo (o "resumo" ou "digest"), de forma determinística e idealmente irreversível. Não é criptografia porque não existe operação inversa para "decifrar" o hash e recuperar a entrada original — seu uso típico é verificar integridade (ex.: MD5, SHA-256) e não garantir confidencialidade.

---

### Pergunta
Como funciona a assinatura digital para garantir integridade, autenticidade e não-repúdio de um documento?

### Resposta
O emitente gera o hash do documento e cifra esse hash com sua chave privada — esse resultado é a assinatura digital. Qualquer pessoa pode decifrar a assinatura com a chave pública do emitente e comparar com o hash calculado sobre o documento recebido: se coincidirem, comprova-se que o documento não foi alterado (integridade), que partiu de quem possui a chave privada correspondente (autenticidade) e que o emitente não pode negar a autoria (não-repúdio), pois só ele possui a chave privada.

---

### Pergunta
Qual a diferença entre vírus, worm e trojan (cavalo de troia)?

### Resposta
Vírus é um código malicioso que se anexa a um arquivo ou programa hospedeiro e precisa da execução deste para se propagar. Worm é um programa autônomo que se replica e se espalha automaticamente pela rede, sem precisar de um hospedeiro ou de ação do usuário. Trojan é um programa que se disfarça de software legítimo para induzir o usuário a executá-lo, mas não se replica sozinho — geralmente abre uma porta de acesso (backdoor) para o atacante.

---

### Pergunta
O que caracteriza um ataque de ransomware?

### Resposta
É um malware que cifra os arquivos da vítima (ou bloqueia o acesso ao sistema) e exige o pagamento de um resgate, geralmente em criptomoeda, para fornecer a chave de decifração ou restabelecer o acesso.

---

### Pergunta
O que é phishing e qual sua principal técnica de ataque?

### Resposta
Phishing é um golpe de engenharia social em que o atacante se passa por uma entidade confiável (banco, órgão público, empresa) para induzir a vítima a fornecer dados sensíveis (senhas, dados bancários) ou a clicar em links/anexos maliciosos, geralmente por e-mail, SMS (smishing) ou mensagens instantâneas.

---

### Pergunta
Qual a diferença entre backup completo, incremental e diferencial?

### Resposta
Backup completo copia todos os dados selecionados a cada execução. Backup incremental copia apenas os dados alterados desde o último backup (completo ou incremental), sendo mais rápido de gerar mas mais lento de restaurar (precisa de toda a cadeia). Backup diferencial copia todos os dados alterados desde o último backup completo, sendo um meio-termo: mais rápido de restaurar que o incremental, pois só depende do último completo mais o último diferencial.

---

### Pergunta
O que é autenticação de múltiplos fatores (MFA) e quais são as três categorias clássicas de fatores?

### Resposta
MFA é o uso combinado de dois ou mais fatores independentes para confirmar a identidade de um usuário, reduzindo o risco de acesso indevido mesmo que um fator seja comprometido. As três categorias clássicas são: algo que você sabe (senha, PIN), algo que você tem (token, celular, cartão) e algo que você é (biometria — digital, íris, face).

---

### Pergunta
Qual a diferença entre um IDS e um IPS?

### Resposta
IDS (Intrusion Detection System) apenas monitora o tráfego/rede em busca de atividades suspeitas e gera alertas, sem interferir no fluxo de dados. IPS (Intrusion Prevention System) fica em linha com o tráfego e, além de detectar, atua ativamente bloqueando ou interrompendo a atividade maliciosa em tempo real.

---

### Pergunta
O que é a LGPD e quem ela busca proteger?

### Resposta
A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) é a legislação brasileira que regula o tratamento de dados pessoais por pessoas físicas ou jurídicas, de direito público ou privado, com o objetivo de proteger os direitos fundamentais de liberdade, privacidade e livre desenvolvimento da personalidade da pessoa natural (titular dos dados).
