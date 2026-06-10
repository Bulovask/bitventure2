import { prisma } from '../database/prisma';

export const SorteioRepository = {
  async create(alunoId: number, questaoId: number) {
    return prisma.sorteio.create({
      data: {
        alunoId,
        questaoId,
        sorteadoEmMs: BigInt(Date.now()),
      },
    });
  },

  async findByAluno(alunoId: number) {
    return prisma.sorteio.findMany({
      where: { alunoId },
    });
  },
};
