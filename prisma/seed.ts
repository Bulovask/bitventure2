import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Configuração Inicial
  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      qtdNivel1: 5,
      qtdNivel2: 5,
      qtdNivel3: 3,
      qtdNivel4: 2,
      tempoNivel1: 30,
      tempoNivel2: 45,
      tempoNivel3: 60,
      tempoNivel4: 90,
      faixaMinNivel1: 0,
      faixaMaxNivel1: 255,
      tamanhoMinPalavra: 3,
      tamanhoMaxPalavra: 8,
      tempoParadaMs: 120000,
      partidaEncerrada: false,
    },
  });

  // Algumas Questões de Exemplo (Nível 1)
  const questoesNivel1 = [
    { nivel: 1, tipo: 'BINARIO_DECIMAL', enunciado: '00001010', respostaCorreta: '10' },
    { nivel: 1, tipo: 'BINARIO_DECIMAL', enunciado: '00010101', respostaCorreta: '21' },
    { nivel: 1, tipo: 'DECIMAL_BINARIO', enunciado: '15', respostaCorreta: '00001111' },
  ];

  for (const q of questoesNivel1) {
    await prisma.questao.create({ data: q });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
