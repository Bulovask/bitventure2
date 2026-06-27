import { ConfiguracaoRepository } from '../repositories/configuracao.repository';

export const ConfiguracaoService = {
  async obterConfiguracao() {
    return ConfiguracaoRepository.get();
  },

  async atualizarConfiguracao(data: {
    qtdNivel1?: number;
    qtdNivel2?: number;
    qtdNivel3?: number;
    qtdNivel4?: number;
    tempoParadaMs?: number;
    partidaEncerrada?: boolean;
    tempoNivel1?: number;
    tempoNivel2?: number;
    tempoNivel3?: number;
    tempoNivel4?: number;
  }) {
    // Aqui poderiam ser adicionadas validações se necessário
    return ConfiguracaoRepository.update(data);
  },
};
