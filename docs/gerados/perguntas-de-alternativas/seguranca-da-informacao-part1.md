### Pergunta
No contexto de Segurança da Informação, o princípio que assegura que uma informação não foi alterada de forma indevida durante seu armazenamento, processamento ou transmissão é denominado:

### Alternativas
- A) Confidencialidade
- B) Disponibilidade
- C) Integridade
- D) Autenticidade

### Resposta Correta
C

### Explicação
Integridade é o princípio que garante que os dados permaneçam completos, exatos e sem alterações não autorizadas. Confidencialidade trata do sigilo do acesso, Disponibilidade trata do acesso quando necessário, e Autenticidade trata da comprovação da origem da informação.

---

### Pergunta
Assinale a alternativa que descreve corretamente a criptografia assimétrica:

### Alternativas
- A) Utiliza uma única chave, compartilhada entre emissor e receptor, para cifrar e decifrar mensagens.
- B) Utiliza um par de chaves distintas, sendo uma pública e outra privada, matematicamente relacionadas.
- C) É sempre mais rápida que a criptografia simétrica, sendo preferida para cifrar grandes volumes de dados.
- D) Dispensa o uso de chave privada, bastando a chave pública para cifrar e decifrar.

### Resposta Correta
B

### Explicação
A criptografia assimétrica usa um par de chaves (pública e privada) matematicamente relacionadas. Ela é mais lenta que a simétrica (eliminando as alternativas A e C) e sempre depende da chave privada para operações como decifrar ou assinar (eliminando a alternativa D).

---

### Pergunta
Um malware que se replica automaticamente e se propaga pela rede sem a necessidade de um arquivo hospedeiro ou de ação do usuário é classificado como:

### Alternativas
- A) Vírus
- B) Trojan
- C) Spyware
- D) Worm

### Resposta Correta
D

### Explicação
Worm é autônomo e se espalha sozinho pela rede. O vírus precisa de um hospedeiro para se propagar, o trojan depende da execução pelo usuário e não se autorreplica, e o spyware tem como foco principal espionar/coletar dados, não a autorreplicação em rede.

---

### Pergunta
Em um ataque de phishing, a principal técnica utilizada pelo atacante é:

### Alternativas
- A) Explorar uma vulnerabilidade de software não corrigida (dia zero) para invadir o sistema.
- B) Sobrecarregar um servidor com requisições até torná-lo indisponível.
- C) Se passar por uma entidade confiável para induzir a vítima a fornecer dados sensíveis ou clicar em links maliciosos.
- D) Interceptar e alterar o tráfego de rede entre duas partes sem que percebam.

### Resposta Correta
C

### Explicação
Phishing é um ataque de engenharia social baseado em enganar a vítima fazendo-se passar por uma fonte confiável. As demais alternativas descrevem, respectivamente, exploit de dia zero, ataque de negação de serviço (DoS) e ataque man-in-the-middle.

---

### Pergunta
Qual modalidade de backup copia todos os arquivos selecionados que foram alterados desde a última execução de um backup completo, exigindo, para restauração, apenas o último backup completo e o último backup dessa modalidade?

### Alternativas
- A) Backup completo
- B) Backup incremental
- C) Backup diferencial
- D) Backup espelhado

### Resposta Correta
C

### Explicação
O backup diferencial sempre parte do último backup completo e acumula todas as alterações desde então, exigindo apenas dois conjuntos de dados para restauração (o completo + o diferencial mais recente). Já o incremental depende de toda a cadeia de incrementos desde o último completo.

---

### Pergunta
A exigência de que um usuário, além da senha, informe um código temporário recebido por um aplicativo autenticador para acessar um sistema, é um exemplo de:

### Alternativas
- A) Criptografia de ponta a ponta
- B) Autenticação de múltiplos fatores (MFA)
- C) Assinatura digital
- D) Controle de acesso baseado em papéis (RBAC)

### Resposta Correta
B

### Explicação
Combinar "algo que você sabe" (senha) com "algo que você tem" (código gerado pelo aplicativo autenticador no celular) caracteriza autenticação de múltiplos fatores, que reduz o risco de acesso indevido mesmo que um dos fatores seja comprometido.

---

### Pergunta
Um dispositivo de segurança que fica em linha com o tráfego de rede e, ao detectar uma atividade maliciosa, é capaz de bloqueá-la automaticamente em tempo real, é classificado como:

### Alternativas
- A) IDS (Intrusion Detection System)
- B) IPS (Intrusion Prevention System)
- C) VPN (Virtual Private Network)
- D) Proxy reverso

### Resposta Correta
B

### Explicação
O IPS atua em linha com o tráfego e bloqueia ativamente ameaças detectadas. O IDS (alternativa A) apenas monitora e alerta, sem bloquear. VPN cria um túnel seguro de comunicação e proxy reverso distribui/intermedia requisições — nenhum dos dois tem como função primária bloquear intrusões em tempo real.
