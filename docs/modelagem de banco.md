# Modelagem de Banco de Dados – Bitventure 2

Para o **Bitventure 2**, a persistência é baseada em **SQLite** utilizando o **Prisma ORM** como camada oficial e única de acesso aos dados.

---

# Modelo Conceitual

## Aluno

Representa o participante da rodada e seu desempenho.

### Campos Principais

| Campo              | Tipo     | Descrição                                      |
| ------------------ | -------- | ---------------------------------------------- |
| id                 | Int      | PK                                             |
| nome               | String   | Nome informado pelo aluno                      |
| pontuacao          | Int      | Total de pontos acumulados                     |
| inicioJogoMs       | BigInt   | Timestamp (ms) de entrada na partida           |
| fimJogoMs          | BigInt?  | Timestamp (ms) de conclusão ou interrupção     |
| tempoConclusaoMs   | BigInt?  | Tempo total decorrido (fim - inicio) em ms     |
| finalizado         | Boolean  | Indica se o aluno concluiu sua participação   |

---

## Questao

Banco mestre de desafios, alimentado pelo professor ou gerado proceduralmente.

### Campos Principais

| Campo           | Tipo    | Descrição                                      |
| --------------- | ------- | ---------------------------------------------- |
| id              | Int     | PK                                             |
| nivel           | Int     | Nível de dificuldade (1 a 4)                   |
| tipo            | Enum    | Tipo da conversão (Ex: BINARIO_DECIMAL)        |
| enunciado       | String  | O desafio apresentado ao aluno                 |
| respostaCorreta | String  | A resposta esperada para validação             |
| origem          | Enum    | BANCO ou GERADA_AUTOMATICAMENTE (RN04)         |
| ativo           | Boolean | Se a questão está disponível para sorteio      |

---

## Configuracao

Parâmetros globais da partida ativa e configurações de fallback.

### Campos Principais

| Campo               | Tipo    | Descrição                                      |
| ------------------- | ------- | ---------------------------------------------- |
| id                  | Int     | PK (Sempre 1)                                  |
| qtdNivel[1-4]       | Int     | Quantidade de questões por nível               |
| faixaMinNivel1      | Int     | Valor decimal mínimo para geração procedural   |
| faixaMaxNivel1      | Int     | Valor decimal máximo para geração procedural   |
| tempoParadaMs       | Int     | Duração do cronômetro de parada (Ex: 120.000)  |
| partidaEncerrada    | Boolean | Estado global da rodada                        |
| paradaAcionadaEmMs  | BigInt? | Timestamp de quando o professor parou o jogo   |

---

# Schema Prisma (schema.prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./bitventure.db"
}

generator client {
  provider = "prisma-client-js"
}

model Aluno {
  id                Int       @id @default(autoincrement())
  nome              String
  pontuacao         Int       @default(0)

  inicioJogoMs      BigInt    // Unix Timestamp em milissegundos
  fimJogoMs         BigInt?   // Unix Timestamp em milissegundos

  tempoConclusaoMs  BigInt?   // Diferença em milissegundos

  finalizado        Boolean   @default(false)

  criadoEm          DateTime  @default(now())

  sorteios          Sorteio[]
  respostas         Resposta[]

  @@index([pontuacao, tempoConclusaoMs])
}

model Questao {
  id               Int           @id @default(autoincrement())
  nivel            Int
  tipo             TipoQuestao
  enunciado        String
  respostaCorreta  String
  origem           OrigemQuestao @default(BANCO)
  ativo            Boolean       @default(true)
  criadaEm         DateTime      @default(now())

  sorteios         Sorteio[]
  respostas        Resposta[]
}

model Configuracao {
  id                    Int       @id @default(1)

  qtdNivel1             Int
  qtdNivel2             Int
  qtdNivel3             Int
  qtdNivel4             Int

  faixaMinNivel1        Int       @default(0)
  faixaMaxNivel1        Int       @default(255)

  tamanhoMinPalavra     Int       @default(3)
  tamanhoMaxPalavra     Int       @default(8)

  tempoParadaMs         Int       @default(120000) // 2 minutos em ms

  partidaEncerrada      Boolean   @default(false)
  paradaAcionadaEmMs    BigInt?
}

model Sorteio {
  id          Int      @id @default(autoincrement())
  alunoId     Int
  questaoId   Int
  sorteadoEmMs BigInt

  aluno       Aluno    @relation(fields: [alunoId], references: [id])
  questao     Questao  @relation(fields: [questaoId], references: [id])

  @@unique([alunoId, questaoId])
  @@index([alunoId])
}

model Resposta {
  id              Int      @id @default(autoincrement())
  alunoId         Int
  questaoId       Int
  resposta        String
  correta         Boolean
  pontosGanhos    Int
  respondidaEmMs  BigInt

  aluno           Aluno   @relation(fields: [alunoId], references: [id])
  questao         Questao @relation(fields: [questaoId], references: [id])

  @@index([alunoId])
}

enum TipoQuestao {
  BINARIO_DECIMAL
  DECIMAL_BINARIO
  BINARIO_ASCII
  ASCII_BINARIO
  BINARIO_PALAVRA
  DECIMAL_PALAVRA
}

enum OrigemQuestao {
  BANCO
  GERADA_AUTOMATICAMENTE
}
```

---

# Considerações de Performance e Desempate

1.  **Ranking:** A ordenação oficial para o critério de desempate (RN02) deve ser:
    ```typescript
    const ranking = await prisma.aluno.findMany({
      orderBy: [
        { pontuacao: 'desc' },
        { tempoConclusaoMs: 'asc' }
      ]
    });
    ```
2.  **Consultas Raw:** Caso o volume de dados exija maior performance no cálculo do ranking em tempo real, utilize `prisma.$queryRaw`.
3.  **Concorrência:** Para gerenciar múltiplas escritas simultâneas (30-40 alunos), recomenda-se configurar o SQLite para o modo WAL (Write-Ahead Logging).
