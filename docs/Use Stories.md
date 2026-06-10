# User Stories – Bitventure 2

# Épico: Controle de Encerramento da Partida

## US01 – Acionar parada da atividade
**Como** professor, **quero** acionar um botão de parada da atividade **para que** todos os alunos entrem em fase de finalização controlada.

- **Critério de Aceitação:** Ao clicar em "Parar", o sistema define um tempo de encerramento de **120.000 milissegundos** e notifica todos os alunos via SSE.

## US02 – Finalizar última questão após acionamento da parada
**Como** aluno, **quero** concluir a questão atual **para que** minha última resposta seja contabilizada.

- **Critério de Aceitação:** O aluno pode enviar a resposta da questão atual dentro do prazo de 120.000ms. Nenhuma nova questão é sorteada após o envio.

## US03 – Bloqueio automático após o término do cronômetro
**Como** professor, **quero** que o sistema bloqueie submissões após o prazo **para que** a avaliação seja encerrada de forma justa.

- **Critério de Aceitação:** Ao atingir o tempo zero (fim dos 120.000ms), o sistema recusa qualquer submissão e redireciona o aluno para o ranking final.

---

# Épico: Sorteio Anti Fila (RN01) e Fallback (RN04)

## US05 – Sorteio individual de questões
**Como** professor, **quero** que cada aluno receba desafios sorteados individualmente **para que** a "cola" seja dificultada.

- **Critério de Aceitação:** Alunos no mesmo nível recebem questões diferentes do banco, mantendo a equivalência de dificuldade.

## US07 – Garantir continuidade da partida (RN04)
**Como** sistema, **quero** gerar desafios automaticamente quando o banco de questões acabar **para que** nenhum aluno fique sem questões durante a partida.

- **Critério de Aceitação:** Se o banco de questões inéditas para um aluno se esgotar, o sistema aplica a **RN04** e gera um novo desafio procedural compatível com o nível atual.

## US09 – Geração Procedural de Desafios (RN04)
**Como** professor, **quero** que o sistema gere desafios baseados em regras (Ex: números aleatórios) **para que** a partida possa continuar mesmo com um banco de questões pequeno.

- **Critério de Aceitação:**
  - **Nível 1:** Gera números decimais aleatórios em uma faixa configurada.
  - **Nível 2:** Gera caracteres ASCII aleatórios.
  - **Níveis 3 e 4:** Gera palavras ou pseudopalavras baseadas em códigos ASCII decimais ou binários.
  - As questões geradas são marcadas como `GERADA_AUTOMATICAMENTE`.

---

# Épico: Desempenho e Ranking (RN02)

## US04 – Exibição do resultado e desempate
**Como** aluno, **quero** ver minha pontuação e posição no ranking **para que** eu saiba meu desempenho.

- **Critério de Aceitação:** O ranking é ordenado por pontuação (maior para menor) e tempo de conclusão em **milissegundos** (menor para maior).
