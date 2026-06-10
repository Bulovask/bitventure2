# Registro de Regras de Negócio Adicionais (RN04)

Este documento descreve a regra de contingência para o sistema Bitventure 2, garantindo que a experiência do aluno não seja interrompida pela falta de conteúdo cadastrado.

### RN04 – Geração Procedural de Desafios (Fallback do Banco)

**Descrição:**
Caso o banco de desafios de um determinado nível não possua itens suficientes para atender a quantidade de questões configurada para a partida, o sistema deverá gerar automaticamente novos desafios equivalentes ao nível de dificuldade solicitado.

#### Regras de Implementação
* **Gatilho:** A geração automática somente ocorrerá quando não existirem mais itens inéditos disponíveis no banco para aquele aluno específico.
* **Ineditismo:** Os desafios gerados não deverão repetir questões já apresentadas ao mesmo aluno durante a partida.
* **Equivalência:** Os desafios gerados deverão respeitar o nível de dificuldade atual do jogador.
* **Auditoria:** Os desafios gerados deverão ser identificados e registrados com a origem `GERADA_AUTOMATICAMENTE`.

#### Critérios por Nível

**Nível 1 – Binário ↔ Decimal**
* Gerar números inteiros aleatórios dentro da faixa configurada (Ex: 0 a 255).
* Exemplo: Decimal 57 → Binário 111001.

**Nível 2 – Binário ↔ ASCII**
* Gerar caracteres ASCII imprimíveis aleatórios.
* Exemplo: Caractere 'A' → Binário 01000001.

**Nível 3 – Binário → Palavra**
* Gerar sequências aleatórias de caracteres ASCII formando palavras ou pseudopalavras.
* Exemplo: 01000011 01000001 01010100 → CAT.

**Nível 4 – Decimal → Palavra**
* Gerar sequências de códigos decimais ASCII formando palavras ou pseudopalavras.
* Exemplo: 67 65 84 → CAT.
