import { prisma } from '../database/prisma';

export const QuestaoRepository = {
  async findByNivel(nivel: number) {
    return prisma.questao.findMany({
      where: {
        nivel,
        ativo: true,
      },
    });
  },

  async findIneditasParaAluno(alunoId: number, nivel: number) {
    // Busca questões do nível que não foram sorteadas para este aluno
    return prisma.questao.findMany({
      where: {
        nivel,
        ativo: true,
        sorteios: {
          none: {
            alunoId,
          },
        },
      },
    });
  },

  async create(data: {
    nivel: number;
    tipo: string;
    enunciado: string;
    respostaCorreta: string;
    origem: string;
  }) {
    return prisma.questao.create({
      data,
    });
  },
};
