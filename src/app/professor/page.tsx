'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true);
  const [partidaEncerrada, setPartidaEncerrada] = useState(false);
  const [toggling, setToggling] = useState(false);

  // States for Export feature (RF08)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [filterSince, setFilterSince] = useState('');
  const [filterAlunoId, setFilterAlunoId] = useState('');
  const [filterNivel, setFilterNivel] = useState('');
  const [alunos, setAlunos] = useState<{ id: number; nome: string }[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/professor/configuracao')
      .then((res) => res.json())
      .then((data) => {
        setPartidaEncerrada(!!data.partidaEncerrada);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar configuração', err);
        setLoading(false);
      });

    // Fetch student list for filter
    fetch('/api/ranking')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlunos(data);
        }
      })
      .catch((err) => console.error('Erro ao buscar alunos para filtro', err));
  }, []);

  const handleTogglePartida = async () => {
    setToggling(true);
    try {
      const novoEstado = !partidaEncerrada;
      const res = await fetch('/api/professor/configuracao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partidaEncerrada: novoEstado }),
      });

      if (res.ok) {
        setPartidaEncerrada(novoEstado);
      } else {
        alert('Erro ao alterar o status da partida.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao alterar o status da partida.');
    } finally {
      setToggling(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportMessage(null);

    try {
      const params = new URLSearchParams();
      params.append('format', exportFormat);
      if (filterSince) {
        const dateObj = new Date(filterSince);
        if (!isNaN(dateObj.getTime())) {
          params.append('since', dateObj.toISOString());
        }
      }
      if (filterAlunoId) {
        params.append('alunoId', filterAlunoId);
      }
      if (filterNivel) {
        params.append('nivel', filterNivel);
      }

      const url = `/api/professor/export?${params.toString()}`;

      if (exportFormat === 'csv') {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setExportMessage({ type: 'success', text: 'Exportação CSV iniciada com sucesso!' });
      } else {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Falha ao exportar dados em formato JSON');
        }
        const data = await res.json();
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `export_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

        setExportMessage({ type: 'success', text: 'Exportação JSON concluída com sucesso!' });
      }
    } catch (err: any) {
      console.error(err);
      setExportMessage({ type: 'error', text: err.message || 'Erro ao realizar a exportação.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-400">Painel do Professor</h1>
        
        {/* Controle da Partida */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Status da Partida</h2>
            {loading ? (
              <p className="text-gray-400">Carregando status...</p>
            ) : (
              <p className={`text-lg font-semibold uppercase ${partidaEncerrada ? 'text-red-500' : 'text-green-400 animate-pulse'}`}>
                {partidaEncerrada ? '● Partida Parada' : '● Partida Ativa (Alunos Jogando)'}
              </p>
            )}
          </div>
          {!loading && (
            <button
              onClick={handleTogglePartida}
              disabled={toggling}
              className={`px-6 py-3 font-bold uppercase rounded shadow transition-all duration-300 active:scale-95 cursor-pointer ${
                partidaEncerrada 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {toggling 
                ? 'Processando...' 
                : partidaEncerrada 
                  ? 'Iniciar / Retomar Partida' 
                  : 'Parar Partida'
              }
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/professor/configuracao" 
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors border border-gray-700">
            <h2 className="text-2xl font-semibold mb-2 text-green-400">Configurações da Partida</h2>
            <p className="text-gray-400">Edite a quantidade de questões por nível e o tempo limite das questões.</p>
          </Link>

          <Link href="/professor/questoes" 
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors border border-gray-700">
            <h2 className="text-2xl font-semibold mb-2 text-yellow-400">Gestão de Questões</h2>
            <p className="text-gray-400">Adicione, edite, remova ou desative questões do banco de dados.</p>
          </Link>
        </div>

        {/* Exportar Dados (RF08) */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold mb-2 text-purple-400">Exportar Relatórios (RF08)</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Exporte logs de jogo e notas dos alunos nos formatos CSV e JSON.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Formato</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="csv">CSV (Excel)</option>
                <option value="json">JSON (Completo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">A partir de (Opcional)</label>
              <input
                type="datetime-local"
                value={filterSince}
                onChange={(e) => setFilterSince(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Aluno (Opcional)</label>
              <select
                value={filterAlunoId}
                onChange={(e) => setFilterAlunoId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos os Alunos</option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Nível (Opcional)</label>
              <select
                value={filterNivel}
                onChange={(e) => setFilterNivel(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos os Níveis</option>
                <option value="1">Nível 1 (Básico)</option>
                <option value="2">Nível 2 (Intermediário)</option>
                <option value="3">Nível 3 (Avançado)</option>
                <option value="4">Nível 4 (Desafio)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-700 pt-4">
            <div className="text-sm font-semibold">
              {exportMessage && (
                <span className={exportMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {exportMessage.text}
                </span>
              )}
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold px-6 py-2 rounded transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer text-sm"
            >
              {exporting ? 'Exportando...' : 'Exportar Dados'}
            </button>
          </div>
        </div>

        <div className="mt-12">
           <Link href="/" className="text-blue-400 hover:underline">← Voltar para a Home</Link>
        </div>
      </div>
    </div>
  );
}
