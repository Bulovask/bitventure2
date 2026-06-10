-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Questao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nivel" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "respostaCorreta" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'BANCO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "excluido" BOOLEAN NOT NULL DEFAULT false,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Questao" ("ativo", "criadaEm", "enunciado", "id", "nivel", "origem", "respostaCorreta", "tipo") SELECT "ativo", "criadaEm", "enunciado", "id", "nivel", "origem", "respostaCorreta", "tipo" FROM "Questao";
DROP TABLE "Questao";
ALTER TABLE "new_Questao" RENAME TO "Questao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
