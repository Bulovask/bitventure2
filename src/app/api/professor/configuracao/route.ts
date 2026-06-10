import { NextResponse } from 'next/server';
import { ConfiguracaoService } from '../../../../services/configuracao.service';

export async function GET() {
  try {
    const config = await ConfiguracaoService.obterConfiguracao();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const configAtualizada = await ConfiguracaoService.atualizarConfiguracao(data);
    return NextResponse.json(configAtualizada);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
