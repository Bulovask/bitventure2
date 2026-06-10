import { NextResponse } from 'next/server';
import { QuestaoService } from '../../../../../services/questao.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const questao = await QuestaoService.buscarPorId(id);
    if (!questao) {
      return NextResponse.json({ error: 'Questão não encontrada' }, { status: 404 });
    }
    return NextResponse.json(questao);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const data = await request.json();
    const questaoAtualizada = await QuestaoService.atualizarQuestao(id, data);
    return NextResponse.json(questaoAtualizada);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await QuestaoService.excluirQuestao(id);
    return NextResponse.json({ message: 'Questão excluída com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
