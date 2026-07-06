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

  async findForExport(filters: {
    since?: Date | string;
    alunoId?: number;
    nivel?: number;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.alunoId) {
      where.alunoId = filters.alunoId;
    }

    if (filters.nivel) {
      where.questao = {
        nivel: filters.nivel,
      };
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since);
      if (!isNaN(sinceDate.getTime())) {
        where.respondidaEmMs = {
          gte: BigInt(sinceDate.getTime()),
        };
      }
    }

    const total = await prisma.resposta.count({ where });

    const data = await prisma.resposta.findMany({
      where,
      include: {
        aluno: {
          include: {
            sorteios: true,
          },
        },
        questao: true,
      },
      orderBy: {
        respondidaEmMs: 'asc',
      },
      ...(filters.limit !== undefined ? { take: filters.limit } : {}),
      ...(filters.offset !== undefined ? { skip: filters.offset } : {}),
    });

    return { total, data };
  },
};
