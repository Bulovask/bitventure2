import { NextRequest, NextResponse } from 'next/server';
import { RespostaRepository } from '../../../../repositories/resposta.repository';

// Helper para escapar valores de CSV conforme padrão RFC 4180
function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Validação de Segurança Mínima
    const host = request.headers.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('[::1]');
    const authHeader = request.headers.get('x-professor-token');
    
    // Suposição: Em modo offline local, a rota é chamada a partir da mesma máquina (localhost)
    // ou de dispositivos remotos na LAN enviando o cabeçalho 'x-professor-token' correspondente.
    const isAuthorized = isLocal || authHeader === 'pibid-offline-token';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Acesso negado. A rota deve ser chamada da máquina servidora local ou conter cabeçalhos de autenticação válidos.' },
        { status: 403 }
      );
    }

    // 2. Parâmetros de Entrada
    const format = searchParams.get('format');
    if (!format || (format !== 'json' && format !== 'csv')) {
      return NextResponse.json(
        { error: 'O parâmetro obrigatório "format" deve ser "json" ou "csv".' },
        { status: 400 }
      );
    }

    const since = searchParams.get('since') || undefined;
    const alunoIdParam = searchParams.get('alunoId');
    const alunoId = alunoIdParam ? parseInt(alunoIdParam, 10) : undefined;
    
    const nivelParam = searchParams.get('nivel');
    const nivel = nivelParam ? parseInt(nivelParam, 10) : undefined;

    // Validações de conversão numérica
    if (alunoIdParam && isNaN(alunoId!)) {
      return NextResponse.json({ error: 'Parâmetro "alunoId" inválido. Deve ser um número.' }, { status: 400 });
    }
    if (nivelParam && isNaN(nivel!)) {
      return NextResponse.json({ error: 'Parâmetro "nivel" inválido. Deve ser um número.' }, { status: 400 });
    }

    const exportadoEm = new Date().toISOString();

    // 3. Processamento e Retorno de Dados em JSON
    if (format === 'json') {
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;
      const offsetParam = searchParams.get('offset');
      const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

      if (limitParam && isNaN(limit!)) {
        return NextResponse.json({ error: 'Parâmetro "limit" inválido. Deve ser um número.' }, { status: 400 });
      }
      if (offsetParam && isNaN(offset!)) {
        return NextResponse.json({ error: 'Parâmetro "offset" inválido. Deve ser um número.' }, { status: 400 });
      }

      const { total, data } = await RespostaRepository.findForExport({
        since,
        alunoId,
        nivel,
        limit,
        offset,
      });

      const dadosMapeados = data.map((row: any) => {
        const respondidaEmMsDate = new Date(Number(row.respondidaEmMs));
        const respondidaEmISO = isNaN(respondidaEmMsDate.getTime()) ? null : respondidaEmMsDate.toISOString();

        const matchingSorteio = row.aluno?.sorteios?.find((s: any) => s.questaoId === row.questaoId);
        let sorteadoEmISO = null;
        if (matchingSorteio) {
          const sorteadoEmDate = new Date(Number(matchingSorteio.sorteadoEmMs));
          sorteadoEmISO = isNaN(sorteadoEmDate.getTime()) ? null : sorteadoEmDate.toISOString();
        }

        return {
          respostaId: row.id,
          alunoId: row.alunoId,
          alunoNome: row.aluno?.nome || '',
          questaoId: row.questaoId,
          nivel: row.questao?.nivel,
          tipoQuestao: row.questao?.tipo || '',
          enunciado: row.questao?.enunciado || '',
          respostaSubmetida: row.resposta,
          correta: row.correta,
          pontosGanhos: row.pontosGanhos,
          respondidaEmMs: respondidaEmISO,
          sorteadoEmMs: sorteadoEmISO,
          partidaId: null, // Campo para extensões futuras de Partida
          exportadoEm,
        };
      });

      return NextResponse.json({
        meta: {
          total,
          limit: limit ?? null,
          offset: offset ?? null,
          filters: {
            since: since || null,
            alunoId: alunoId ?? null,
            nivel: nivel ?? null,
          },
          exportadoEm,
        },
        dados: dadosMapeados,
      });
    }

    // 4. Processamento e Retorno de Dados em CSV via Streaming
    // Para evitar alocação de todo o conteúdo em memória, lemos do banco de dados em páginas/lotes
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const push = (str: string) => controller.enqueue(encoder.encode(str));

        // Adiciona UTF-8 BOM para compatibilidade com Microsoft Excel
        push('\uFEFF');

        // Escreve os cabeçalhos das colunas
        const csvHeaders = [
          'respostaId',
          'alunoId',
          'alunoNome',
          'questaoId',
          'nivel',
          'tipoQuestao',
          'enunciado',
          'respostaSubmetida',
          'correta',
          'pontosGanhos',
          'respondidaEmMs',
          'sorteadoEmMs',
          'partidaId',
          'exportadoEm',
        ];
        push(csvHeaders.join(',') + '\n');

        const batchSize = 100;
        let skip = 0;
        let hasMore = true;

        while (hasMore) {
          const { data } = await RespostaRepository.findForExport({
            since,
            alunoId,
            nivel,
            limit: batchSize,
            offset: skip,
          });

          if (data.length === 0) {
            hasMore = false;
            break;
          }

          for (const row of data) {
            const respondidaEmMsDate = new Date(Number(row.respondidaEmMs));
            const respondidaEmISO = isNaN(respondidaEmMsDate.getTime()) ? '' : respondidaEmMsDate.toISOString();

            const matchingSorteio = row.aluno?.sorteios?.find((s: any) => s.questaoId === row.questaoId);
            let sorteadoEmISO = '';
            if (matchingSorteio) {
               const sorteadoEmDate = new Date(Number(matchingSorteio.sorteadoEmMs));
               sorteadoEmISO = isNaN(sorteadoEmDate.getTime()) ? '' : sorteadoEmDate.toISOString();
            }

            const csvRow = [
              row.id,
              row.alunoId,
              row.aluno?.nome || '',
              row.questaoId,
              row.questao?.nivel,
              row.questao?.tipo || '',
              row.questao?.enunciado || '',
              row.resposta,
              row.correta,
              row.pontosGanhos,
              respondidaEmISO,
              sorteadoEmISO,
              '', // partidaId (vazio/indefinido)
              exportadoEm,
            ].map(escapeCSVValue).join(',') + '\n';

            push(csvRow);
          }

          skip += batchSize;
          if (data.length < batchSize) {
            hasMore = false;
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="export_${Date.now()}.csv"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Erro ao exportar dados:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor ao exportar dados.' }, { status: 500 });
  }
}
