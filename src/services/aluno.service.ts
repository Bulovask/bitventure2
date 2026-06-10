import { AlunoRepository } from '../repositories/aluno.repository';

export const AlunoService = {
  async entrarNaPartida(nome: string) {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    return AlunoRepository.create(nome.trim());
  },

  async getRanking() {
    return AlunoRepository.getRanking();
  },

  async finalizarParticipacao(alunoId: number) {
    const aluno = await AlunoRepository.findById(alunoId);
    if (!aluno) throw new Error('Aluno não encontrado');

    // Garante que o cálculo seja executado apenas uma vez
    if (aluno.finalizado) return aluno;

    const fimJogoMs = BigInt(Date.now());
    const tempoConclusaoMs = fimJogoMs - aluno.inicioJogoMs;

    return AlunoRepository.finalizarJogo(alunoId, fimJogoMs, tempoConclusaoMs);
  },
};
