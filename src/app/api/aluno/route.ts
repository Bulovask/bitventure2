import { NextResponse } from 'next/server';
import { AlunoService } from '../../../services/aluno.service';

export async function POST(request: Request) {
  try {
    const { nome } = await request.json();

    if (!nome) {
      return NextResponse.json(
        { error: 'O nome é obrigatório para entrar na partida.' },
        { status: 400 }
      );
    }

    const aluno = await AlunoService.entrarNaPartida(nome);

    // Retorna os dados básicos do aluno para serem salvos no localStorage/contexto do cliente
    return NextResponse.json({
      id: aluno.id,
      nome: aluno.nome,
      inicioJogoMs: aluno.inicioJogoMs.toString(), // BigInt needs to be stringified for JSON
    });
  } catch (error: any) {
    console.error('Erro ao entrar na partida:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar a entrada.' },
      { status: 500 }
    );
  }
}
