import { NextResponse } from 'next/server';
import { AlunoService } from '../../../../services/aluno.service';

export async function POST(request: Request) {
  try {
    const { alunoId } = await request.json();

    if (!alunoId) {
      return NextResponse.json({ error: 'alunoId é obrigatório' }, { status: 400 });
    }

    const aluno = await AlunoService.finalizarParticipacao(Number(alunoId));

    return NextResponse.json({
      id: aluno.id,
      nome: aluno.nome,
      pontuacao: aluno.pontuacao,
      tempoConclusaoMs: aluno.tempoConclusaoMs?.toString(), // BigInt to string
    });
  } catch (error: any) {
    console.error('Erro ao finalizar participação:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
