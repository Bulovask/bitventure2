import { QuestaoRepository } from '../repositories/questao.repository';
import { ConfiguracaoRepository } from '../repositories/configuracao.repository';
import { SorteioRepository } from '../repositories/sorteio.repository';
import { RespostaRepository } from '../repositories/resposta.repository';
import { AlunoRepository } from '../repositories/aluno.repository';
import { prisma } from '../database/prisma';

export const QuestaoService = {
  async sortearQuestao(alunoId: number, nivel: number) {
    const questoesIneditas = await QuestaoRepository.findIneditasParaAluno(alunoId, nivel);
    let sorteada: any;

    if (questoesIneditas.length > 0) {
      sorteada = questoesIneditas[Math.floor(Math.random() * questoesIneditas.length)];
    } else {
      // RN04 - Geração Procedural
      sorteada = await this.gerarQuestaoProcedural(nivel);
      
      // Se a questão foi gerada proceduralmente, precisamos criá-la no banco primeiro para ter um ID
      // (a menos que optemos por não registrar questões procedurais na tabela 'questoes', 
      // mas o SAD diz que elas devem ser registradas com origem GERADA_AUTOMATICAMENTE)
      sorteada = await QuestaoRepository.create({
        nivel: sorteada.nivel,
        tipo: sorteada.tipo,
        enunciado: sorteada.enunciado,
        respostaCorreta: sorteada.respostaCorreta,
        origem: sorteada.origem,
      });
    }

    // Registrar o sorteio para auditoria e evitar repetições (RN01)
    await SorteioRepository.create(alunoId, sorteada.id);

    return sorteada;
  },

  async responderQuestao(alunoId: number, questaoId: number, resposta: string, resultado?: number) {
    const questao = await prisma.questao.findUnique({ where: { id: questaoId } });
    if (!questao) throw new Error('Questão não encontrada');

    let finalResultado = resultado;
    if (finalResultado === undefined) {
      const correta = questao.respostaCorreta.trim().toLowerCase() === resposta.trim().toLowerCase();
      finalResultado = correta ? 1 : -1;
    }

    const correta = finalResultado === 1;
    const pontosGanhos = finalResultado; // -1 erro, 0 pulado/tempo esgotado, 1 acerto

    // Registrar a resposta
    await RespostaRepository.create({
      alunoId,
      questaoId,
      resposta,
      correta,
      resultado: finalResultado,
      pontosGanhos,
    });

    // Atualizar pontuação do aluno (pode decrementar se for -1, ou somar se for 1)
    await AlunoRepository.updatePontuacao(alunoId, pontosGanhos);

    return { correta, pontosGanhos, resultado: finalResultado };
  },

  async getProximaEtapa(alunoId: number) {
    const config = await ConfiguracaoRepository.get();
    if (!config) throw new Error('Configuração não encontrada');

    // RN: Se a partida foi encerrada pelo professor, interrompe o fluxo do aluno
    if (config.partidaEncerrada) {
      return { nivel: 1, tempoLimiteSegundos: 0, concluido: false, partidaEncerrada: true };
    }

    // Verifica progresso em cada nível
    const niveis = [
      { nivel: 1, qtd: config.qtdNivel1, tempo: config.tempoNivel1 },
      { nivel: 2, qtd: config.qtdNivel2, tempo: config.tempoNivel2 },
      { nivel: 3, qtd: config.qtdNivel3, tempo: config.tempoNivel3 },
      { nivel: 4, qtd: config.qtdNivel4, tempo: config.tempoNivel4 },
    ];

    for (const etapa of niveis) {
      const respondidas = await RespostaRepository.countPorNivel(alunoId, etapa.nivel);
      if (respondidas < etapa.qtd) {
        return { 
          nivel: etapa.nivel, 
          tempoLimiteSegundos: etapa.tempo, 
          concluido: false, 
          partidaEncerrada: false 
        };
      }
    }

    return { nivel: 4, tempoLimiteSegundos: 0, concluido: true, partidaEncerrada: false };
  },

  async listarTodas() {
    return QuestaoRepository.findAll();
  },

  async buscarPorId(id: number) {
    return QuestaoRepository.findById(id);
  },

  async criarQuestao(data: {
    nivel: number;
    tipo: string;
    enunciado: string;
    respostaCorreta: string;
    ativo?: boolean;
  }) {
    return QuestaoRepository.create({
      ...data,
      origem: 'BANCO',
    });
  },

  async atualizarQuestao(id: number, data: any) {
    return QuestaoRepository.update(id, data);
  },

  async excluirQuestao(id: number) {
    return QuestaoRepository.deleteLogico(id);
  },

  async gerarQuestaoProcedural(nivel: number) {
    const config = await ConfiguracaoRepository.get();
    
    switch (nivel) {
      case 1:
        return this.gerarNivel1(config);
      case 2:
        return this.gerarNivel2();
      case 3:
        return this.gerarNivel3(config);
      case 4:
        return this.gerarNivel4(config);
      default:
        throw new Error('Nível inválido');
    }
  },

  gerarNivel1(config: any) {
    const min = config?.faixaMinNivel1 ?? 0;
    const max = config?.faixaMaxNivel1 ?? 255;
    const decimal = Math.floor(Math.random() * (max - min + 1)) + min;
    const binario = decimal.toString(2).padStart(8, '0');
    
    const isBinToDec = Math.random() > 0.5;

    return {
      id: 0, // ID 0 indica questão gerada dinamicamente
      nivel: 1,
      tipo: isBinToDec ? 'BINARIO_DECIMAL' : 'DECIMAL_BINARIO',
      enunciado: isBinToDec ? binario : decimal.toString(),
      respostaCorreta: isBinToDec ? decimal.toString() : binario,
      origem: 'GERADA_AUTOMATICAMENTE',
      ativo: true,
    };
  },

  gerarNivel2() {
    const charCode = Math.floor(Math.random() * (90 - 65 + 1)) + 65; // A-Z
    const char = String.fromCharCode(charCode);
    const binario = charCode.toString(2).padStart(8, '0');

    const isBinToAscii = Math.random() > 0.5;

    return {
      id: 0,
      nivel: 2,
      tipo: isBinToAscii ? 'BINARIO_ASCII' : 'ASCII_BINARIO',
      enunciado: isBinToAscii ? binario : char,
      respostaCorreta: isBinToAscii ? char : binario,
      origem: 'GERADA_AUTOMATICAMENTE',
      ativo: true,
    };
  },

  gerarNivel3(config: any) {
    const tamanho = Math.floor(Math.random() * ((config?.tamanhoMaxPalavra ?? 5) - (config?.tamanhoMinPalavra ?? 3) + 1)) + (config?.tamanhoMinPalavra ?? 3);
    let palavra = '';
    let binarios = [];

    for (let i = 0; i < tamanho; i++) {
      const charCode = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
      palavra += String.fromCharCode(charCode);
      binarios.push(charCode.toString(2).padStart(8, '0'));
    }

    return {
      id: 0,
      nivel: 3,
      tipo: 'BINARIO_PALAVRA',
      enunciado: binarios.join(' '),
      respostaCorreta: palavra,
      origem: 'GERADA_AUTOMATICAMENTE',
      ativo: true,
    };
  },

  gerarNivel4(config: any) {
    const tamanho = Math.floor(Math.random() * ((config?.tamanhoMaxPalavra ?? 5) - (config?.tamanhoMinPalavra ?? 3) + 1)) + (config?.tamanhoMinPalavra ?? 3);
    let palavra = '';
    let decimais = [];

    for (let i = 0; i < tamanho; i++) {
      const charCode = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
      palavra += String.fromCharCode(charCode);
      decimais.push(charCode.toString());
    }

    return {
      id: 0,
      nivel: 4,
      tipo: 'DECIMAL_PALAVRA',
      enunciado: decimais.join(' '),
      respostaCorreta: palavra,
      origem: 'GERADA_AUTOMATICAMENTE',
      ativo: true,
    };
  },

  async gerarSugestao(nivel: number, tipo: string) {
    const config = await ConfiguracaoRepository.get();
    
    if (nivel === 1) {
      const min = config?.faixaMinNivel1 ?? 0;
      const max = config?.faixaMaxNivel1 ?? 255;
      const decimal = Math.floor(Math.random() * (max - min + 1)) + min;
      const binario = decimal.toString(2).padStart(8, '0');
      
      if (tipo === 'BINARIO_DECIMAL') {
        return { enunciado: binario, respostaCorreta: decimal.toString() };
      } else {
        return { enunciado: decimal.toString(), respostaCorreta: binario };
      }
    } else if (nivel === 2) {
      const charCode = Math.floor(Math.random() * (90 - 65 + 1)) + 65; // A-Z
      const char = String.fromCharCode(charCode);
      const binario = charCode.toString(2).padStart(8, '0');
      
      if (tipo === 'BINARIO_ASCII') {
        return { enunciado: binario, respostaCorreta: char };
      } else {
        return { enunciado: char, respostaCorreta: binario };
      }
    } else if (nivel === 3) {
      const tamanho = Math.floor(Math.random() * ((config?.tamanhoMaxPalavra ?? 5) - (config?.tamanhoMinPalavra ?? 3) + 1)) + (config?.tamanhoMinPalavra ?? 3);
      let palavra = '';
      let binarios = [];
      for (let i = 0; i < tamanho; i++) {
        const charCode = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
        palavra += String.fromCharCode(charCode);
        binarios.push(charCode.toString(2).padStart(8, '0'));
      }
      return { enunciado: binarios.join(' '), respostaCorreta: palavra };
    } else if (nivel === 4) {
      const tamanho = Math.floor(Math.random() * ((config?.tamanhoMaxPalavra ?? 5) - (config?.tamanhoMinPalavra ?? 3) + 1)) + (config?.tamanhoMinPalavra ?? 3);
      let palavra = '';
      let decimais = [];
      for (let i = 0; i < tamanho; i++) {
        const charCode = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
        palavra += String.fromCharCode(charCode);
        decimais.push(charCode.toString());
      }
      return { enunciado: decimais.join(' '), respostaCorreta: palavra };
    }
    
    throw new Error('Nível ou tipo inválido para geração');
  },
};
