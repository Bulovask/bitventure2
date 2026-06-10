import { prisma } from '../database/prisma';

export const AlunoRepository = {
  async create(nome: string) {
    return prisma.aluno.create({
      data: {
        nome,
        inicioJogoMs: BigInt(Date.now()),
        pontuacao: 0,
        finalizado: false,
      },
    });
  },

  async findById(id: number) {
    return prisma.aluno.findUnique({
      where: { id },
    });
  },

  async updatePontuacao(id: number, pontos: number) {
    return prisma.aluno.update({
      where: { id },
      data: {
        pontuacao: {
          increment: pontos,
        },
      },
    });
  },

  async finalizarJogo(id: number, fimJogoMs: bigint, tempoConclusaoMs: bigint) {
    return prisma.aluno.update({
      where: { id },
      data: {
        finalizado: true,
        fimJogoMs,
        tempoConclusaoMs,
      },
    });
  },

  async getRanking() {
    return prisma.aluno.findMany({
      orderBy: [
        { pontuacao: 'desc' },
        { tempoConclusaoMs: 'asc' },
      ],
    });
  },
};
