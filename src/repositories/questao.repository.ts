import { prisma } from '../database/prisma';

export const QuestaoRepository = {
  async findAll() {
    return prisma.questao.findMany({
      where: {
        excluido: false,
      },
      orderBy: {
        id: 'desc',
      },
    });
  },

  async findById(id: number) {
    return prisma.questao.findUnique({
      where: {
        id,
        excluido: false,
      },
    });
  },

  async findByNivel(nivel: number) {
    return prisma.questao.findMany({
      where: {
        nivel,
        ativo: true,
        excluido: false,
      },
    });
  },

  async findIneditasParaAluno(alunoId: number, nivel: number) {
    // Busca questões do nível que não foram sorteadas para este aluno
    return prisma.questao.findMany({
      where: {
        nivel,
        ativo: true,
        excluido: false,
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
    ativo?: boolean;
  }) {
    return prisma.questao.create({
      data: {
        ...data,
        excluido: false,
      },
    });
  },

  async update(id: number, data: any) {
    return prisma.questao.update({
      where: { id },
      data,
    });
  },

  async deleteLogico(id: number) {
    return prisma.questao.update({
      where: { id },
      data: {
        excluido: true,
        ativo: false,
      },
    });
  },
};
