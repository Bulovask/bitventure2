import { prisma } from '../database/prisma';

export const ConfiguracaoRepository = {
  async get() {
    return prisma.configuracao.findUnique({
      where: { id: 1 },
    });
  },

  async update(data: any) {
    return prisma.configuracao.update({
      where: { id: 1 },
      data,
    });
  },

  async setParadaMs(paradaAcionadaEmMs: bigint, stopAtMs: number) {
    return prisma.configuracao.update({
      where: { id: 1 },
      data: {
        paradaAcionadaEmMs,
        tempoParadaMs: stopAtMs,
      },
    });
  },

  async encerrarPartida() {
    return prisma.configuracao.update({
      where: { id: 1 },
      data: {
        partidaEncerrada: true,
      },
    });
  },
};
