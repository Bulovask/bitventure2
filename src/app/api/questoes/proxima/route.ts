import { NextResponse } from 'next/server';
import { QuestaoService } from '../../../../services/questao.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const alunoId = searchParams.get('alunoId');

  if (!alunoId) {
    return NextResponse.json({ error: 'alunoId é obrigatório' }, { status: 400 });
  }

  try {
    const etapa = await QuestaoService.getProximaEtapa(Number(alunoId));
    
    if (etapa.partidaEncerrada) {
      return NextResponse.json({ partidaEncerrada: true });
    }

    if (etapa.concluido) {
      return NextResponse.json({ concluido: true });
    }

    const questao = await QuestaoService.sortearQuestao(Number(alunoId), etapa.nivel);

    return NextResponse.json({
      questao: {
        id: questao.id,
        nivel: questao.nivel,
        tipo: questao.tipo,
        enunciado: questao.enunciado,
        respostaCorreta: questao.respostaCorreta,
      },
      tempoLimiteSegundos: etapa.tempoLimiteSegundos,
      concluido: false,
    });
  } catch (error: any) {
    console.error('Erro ao buscar próxima questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
