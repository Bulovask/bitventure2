import { NextResponse } from 'next/server';
import { QuestaoService } from '../../../../services/questao.service';

export async function POST(request: Request) {
  try {
    const { alunoId, questaoId, resposta } = await request.json();

    if (!alunoId || !questaoId || resposta === undefined) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const resultado = await QuestaoService.responderQuestao(
      Number(alunoId),
      Number(questaoId),
      resposta
    );

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro ao responder questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
