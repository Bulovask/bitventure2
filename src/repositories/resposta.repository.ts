import { prisma } from '../database/prisma';

export const RespostaRepository = {
  async create(data: {
    alunoId: number;
    questaoId: number;
    resposta: string;
    correta: boolean;
    resultado: number;
    pontosGanhos: number;
  }) {
    return prisma.resposta.create({
      data: {
        ...data,
        respondidaEmMs: BigInt(Date.now()),
      },
    });
  },

  async countPorNivel(alunoId: number, nivel: number) {
    return prisma.resposta.count({
      where: {
        alunoId,
        questao: {
          nivel,
        },
      },
    });
  },
};
