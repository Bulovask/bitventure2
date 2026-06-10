# Documento de Casos de Uso (UCD) – Bitventure 2

**Versão:** 1.1

---

# UC01 – Entrar na Partida

## Identificação
**ID:** UC01  
**Nome:** Entrar na Partida  

## Atores
- Aluno

## Fluxo Principal
1. O aluno acessa a aplicação.
2. O sistema exibe a tela de entrada.
3. O aluno informa seu nome.
4. O aluno aciona o comando "Entrar".
5. O sistema valida o nome e registra o início da participação (timestamp em ms).
6. O sistema inicializa a pontuação (zero) e identifica o primeiro nível.
7. O sistema realiza o sorteio da primeira questão (RN01 - Antifila).
8. O sistema apresenta a questão ao aluno.

---

# UC02 – Responder Questão e Progredir

## Identificação
**ID:** UC02  
**Nome:** Responder Questão e Progredir

## Fluxo Principal
1. O aluno envia a resposta para a questão atual.
2. O sistema valida a resposta e calcula a pontuação.
3. O sistema atualiza a pontuação acumulada e o histórico de respostas.
4. O sistema verifica se o nível atual foi concluído ou se há mais questões previstas.
5. O sistema realiza um novo sorteio individual (RN01).
6. O sistema apresenta a nova questão.

## Fluxos Alternativos
### FA03 – Banco insuficiente de questões (RN04)
1. O sistema identifica que não existem mais questões inéditas no banco para o aluno naquele nível.
2. O sistema ativa a **Geração Procedural de Desafios**.
3. O sistema gera uma questão equivalente ao nível atual (Ex: Nível 1 - Inteiro aleatório).
4. O sistema registra a questão com origem `GERADA_AUTOMATICAMENTE`.
5. O sistema apresenta a questão gerada ao aluno.

---

# UC03 – Acionar Botão de Parada e Encerrar Partida

## Identificação
**ID:** UC03  
**Nome:** Acionar Botão de Parada e Encerrar Partida

## Fluxo Principal
1. O professor aciona o botão "Parar" no painel administrativo.
2. O sistema define o timestamp de encerramento (`stopAtMs = atual + 120.000`).
3. O sistema envia evento SSE para todos os alunos com o timestamp.
4. O sistema marca a questão atual de cada aluno como a última da rodada.
5. Alunos têm até o fim dos **120.000 milissegundos** para submeter a resposta final.
6. Ao final do tempo, o sistema bloqueia submissões e redireciona para a tela de Fim de Jogo.

---

# UC04 – Configurar Banco de Desafios e Partida

## Identificação
**ID:** UC04  
**Nome:** Configurar Banco de Desafios e Partida

## Fluxo Principal
1. O professor gerencia o banco de desafios (CRUD).
2. O professor configura a partida definindo a quantidade de questões por nível.
3. O professor define os parâmetros da **RN04** (faixas numéricas e tamanho de palavras para geração procedural).
4. O sistema salva as configurações via Prisma.
5. A partida fica disponível para os alunos.

---

# Critérios Globais de Encerramento
Uma participação é considerada concluída quando:
1. O aluno conclui todas as questões previstas.
2. O cronômetro de 120.000ms após o botão "Parar" atinge zero.
3. O sistema registra a `pontuacao` e o `tempoConclusaoMs` para o ranking (RN02).
