-- CreateTable
CREATE TABLE "Aluno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "inicioJogoMs" BIGINT NOT NULL,
    "fimJogoMs" BIGINT,
    "tempoConclusaoMs" BIGINT,
    "finalizado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Questao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nivel" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "respostaCorreta" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'BANCO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "qtdNivel1" INTEGER NOT NULL,
    "qtdNivel2" INTEGER NOT NULL,
    "qtdNivel3" INTEGER NOT NULL,
    "qtdNivel4" INTEGER NOT NULL,
    "faixaMinNivel1" INTEGER NOT NULL DEFAULT 0,
    "faixaMaxNivel1" INTEGER NOT NULL DEFAULT 255,
    "tamanhoMinPalavra" INTEGER NOT NULL DEFAULT 3,
    "tamanhoMaxPalavra" INTEGER NOT NULL DEFAULT 8,
    "tempoParadaMs" INTEGER NOT NULL DEFAULT 120000,
    "partidaEncerrada" BOOLEAN NOT NULL DEFAULT false,
    "paradaAcionadaEmMs" BIGINT
);

-- CreateTable
CREATE TABLE "Sorteio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alunoId" INTEGER NOT NULL,
    "questaoId" INTEGER NOT NULL,
    "sorteadoEmMs" BIGINT NOT NULL,
    CONSTRAINT "Sorteio_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sorteio_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alunoId" INTEGER NOT NULL,
    "questaoId" INTEGER NOT NULL,
    "resposta" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "pontosGanhos" INTEGER NOT NULL,
    "respondidaEmMs" BIGINT NOT NULL,
    CONSTRAINT "Resposta_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resposta_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Aluno_pontuacao_tempoConclusaoMs_idx" ON "Aluno"("pontuacao", "tempoConclusaoMs");

-- CreateIndex
CREATE INDEX "Sorteio_alunoId_idx" ON "Sorteio"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "Sorteio_alunoId_questaoId_key" ON "Sorteio"("alunoId", "questaoId");

-- CreateIndex
CREATE INDEX "Resposta_alunoId_idx" ON "Resposta"("alunoId");
