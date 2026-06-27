import { NextResponse } from 'next/server';
import { QuestaoService } from '../../../../services/questao.service';

export async function POST(request: Request) {
  try {
    const { alunoId, questaoId, resposta, resultado } = await request.json();

    if (!alunoId || !questaoId || (resposta === undefined && resultado === undefined)) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const resultadoFinal = await QuestaoService.responderQuestao(
      Number(alunoId),
      Number(questaoId),
      resposta || "",
      resultado !== undefined ? Number(resultado) : undefined
    );

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro ao responder questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
