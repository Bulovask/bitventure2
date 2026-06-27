import { NextResponse } from 'next/server';
import { QuestaoService } from '../../../../../services/questao.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nivelStr = searchParams.get('nivel');
    const tipo = searchParams.get('tipo');

    if (!nivelStr || !tipo) {
      return NextResponse.json({ error: 'Nível e tipo são obrigatórios' }, { status: 400 });
    }

    const nivel = parseInt(nivelStr);
    const sugestao = await QuestaoService.gerarSugestao(nivel, tipo);

    return NextResponse.json(sugestao);
  } catch (error: any) {
    console.error('Erro ao sugerir questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
