import { NextResponse } from 'next/server';
import { AlunoService } from '../../../services/aluno.service';

export async function GET() {
  try {
    const ranking = await AlunoService.getRanking();
    
    // Serialização de BigInt para JSON
    const rankingSerializado = ranking.map((aluno, index) => ({
      posicao: index + 1,
      id: aluno.id,
      nome: aluno.nome,
      pontuacao: aluno.pontuacao,
      tempoConclusaoMs: aluno.tempoConclusaoMs?.toString() || null,
      finalizado: aluno.finalizado,
      criadoEm: aluno.criadoEm,
    }));

    return NextResponse.json(rankingSerializado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
