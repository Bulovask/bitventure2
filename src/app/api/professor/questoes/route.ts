import { NextResponse } from 'next/server';
import { QuestaoService } from '../../../../services/questao.service';

export async function GET() {
  try {
    const questoes = await QuestaoService.listarTodas();
    return NextResponse.json(questoes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const novaQuestao = await QuestaoService.criarQuestao(data);
    return NextResponse.json(novaQuestao, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
