# 📑 Especificação de Requisitos de Software (SRS) – Bitventure 2

## 1. Visão Geral do Sistema

O **Bitventure 2** é uma aplicação web de avaliação gamificada sobre sistemas de numeração binária e codificação ASCII. O sistema opera de forma **totalmente offline**, rodando em um servidor local (computador do professor) e distribuído via roteador Wi-Fi local para os dispositivos dos alunos. O objetivo é oferecer uma avaliação flexível, controlada em tempo real pelo professor, com apelo visual de jogo e atualização de pontuação instantânea.

---

## 2. Regras de Negócio Cruciais (Adicionadas/Refinadas)

* **RN01 – Antifila (Sorteio Individual):** O sistema não terá inserção manual de questões por partida. O professor cadastrará ou usará um banco de palavras/números categorizados por dificuldade. Para cada aluno, o sistema sorteará de forma aleatória e individual as questões, garantindo que vizinhos de carteira tenham desafios diferentes, mas com o mesmo nível de complexidade.
* **RN02 – Critério de Desempate:** O ranking será ordenado por **Pontuação (Decrescente)** e, em caso de empate, pelo **Tempo de Conclusão em Milissegundos (Crescente)**.
* **RN03 – Fluxo de Encerramento (Fim de Jogo):** Assim que o cronômetro de 2 minutos (disparado pelo botão "Parar" do professor) se esgotar, a tela do aluno será bloqueada para novas respostas, sendo redirecionada imediatamente para a tela de **Fim de Jogo**, exibindo sua pontuação final e sua respectiva colocação no ranking.
* **RN04 – Geração Procedural de Desafios (Fallback do Banco):** Caso o banco de desafios de um determinado nível não possua itens suficientes para atender a quantidade de questões configurada para a partida, o sistema deverá gerar automaticamente novos desafios equivalentes ao nível de dificuldade solicitado.

---

## 3. Requisitos Funcionais (RF)

### 3.1. Módulo do Aluno (Painel de Jogo)

* **RF01 – Acesso Simplificado:** O aluno deve acessar o sistema informando apenas o seu nome (sem necessidade de cadastro prévio ou senha).
* **RF02 – Progressão Gradual de Desafios:** O jogo deve apresentar as questões em ordem crescente de dificuldade, onde cada questão é sorteada dinamicamente do banco de dados para aquele aluno específico e divididas nos seguintes tipos:
* *Nível 1:* Conversão de Binário para Decimal (e vice-versa).
* *Nível 2:* Conversão de Binário para Caractere ASCII (e vice-versa).
* *Nível 3:* Conversão de sequências de Decimais em palavras completas (usando a tabela ASCII).
* *Nível 4:* Conversão de sequências de Binários em palavras completas (usando a tabela ASCII).

* **RF03 – Ferramentas de Apoio:** A interface do aluno deve disponibilizar:
* Uma calculadora simples de soma.
* Uma tabela consultiva de caracteres ASCII.


* **RF04 – Envio e Pontuação:** A cada resposta submetida, o sistema deve validar localmente ou via API local, contabilizar a pontuação e enviar o progresso imediatamente para o servidor. Na tela de Fim de Jogo deve ser exibido a nota final e posição no ranking assim que o tempo expirar ou o aluno concluir todas as questões.

### 3.2. Módulo do Professor (Painel Administrativo - Rota Protegida)

* **RF05 – Configuração do Banco de Desafios:** Tela para gerenciar (inserir/remover) as palavras e números que alimentam os grupos de dificuldade.
* **RF06 – Configuração da Partida:** O professor define a quantidade de questões que a rodada terá para cada nível de dificuldade.
* **RF07 – Controle de Fluxo (Botão de Parada de Emergência):** O professor deve ter um comando para interromper a atividade. Ao ser acionado:
* A questão atual do aluno passa a ser, obrigatoriamente, a última.
* Um cronômetro regressivo de **120.000 milissegundos (2 minutos)** é iniciado na tela do aluno para finalização da resposta.
* Após o tempo esgotado, o sistema bloqueia novas submissões daquela partida.
* **RF08 – Exportação de Dados:** O painel deve permitir exportar a tabela de notas e logs dos alunos nos formatos **JSON** e **CSV**.

### 3.3. Módulo de Exibição (Painel de Ranking - Rota Pública/Projetor)

* **RF09 – Ranking Dinâmico:** Rota pública (ex: `/ranking`) que exibe o placar atualizado via WebSocket/Polling, aplicando a ordenação por pontos e o desempate por tempo em milissegundos.
* **RF10 – Sincronização Dinâmica:** O ranking deve se atualizar automaticamente (via WebSockets ou Server-Sent Events/Polling curto) à medida que os alunos pontuam, sem necessidade de atualizar a página manual do projetor.

---

## 4. Requisitos Não-Funcionais (RNF)

* **RNF01 – Arquitetura Offline-First (LAN):** O sistema deve funcionar perfeitamente sem nenhuma dependência de conexão com a internet externa. Toda a comunicação deve ocorrer estritamente na rede local gerada pelo roteador dedicado.
* **RNF02 – Banco de Dados Local:** Armazenamento de dados persistido em arquivo local utilizando **SQLite**.
* **RNF03 – Stack Tecnológica:** Desenvolvimento utilizando o ecossistema **Next.js** e **Prisma ORM** como única camada de persistência.
* **RNF04 – Performance de Escopo Local:** O servidor local instalado na máquina do professor deve suportar o acesso simultâneo de uma turma (estimada em média entre 30 a 40 dispositivos). Para consultas de alta performance, o Prisma poderá utilizar `prisma.$queryRaw`.
