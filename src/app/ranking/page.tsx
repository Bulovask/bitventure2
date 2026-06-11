'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AlunoRanking {
  posicao: number;
  nome: string;
  pontuacao: number;
  tempoConclusaoMs: string | null;
  finalizado: boolean;
}

export default function RankingPagina() {
  const [ranking, setRanking] = useState<AlunoRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranking')
      .then((res) => res.json())
      .then((data) => {
        setRanking(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatarTempo = (msStr: string | null) => {
    if (!msStr) return '--:--';
    const ms = parseInt(msStr);
    const segundosTotais = Math.floor(ms / 1000);
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">Carregando Ranking...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
            Ranking Global
          </h1>
          <Link href="/" className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg border border-gray-700 transition-colors">
            Voltar para Início
          </Link>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-750 text-gray-400 uppercase text-sm">
              <tr>
                <th className="px-8 py-5">#</th>
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5 text-center">Pontuação</th>
                <th className="px-8 py-5 text-center">Tempo</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {ranking.map((aluno) => (
                <tr key={aluno.posicao} className={`hover:bg-gray-750 transition-colors ${aluno.posicao === 1 ? 'bg-yellow-900/10' : ''}`}>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      aluno.posicao === 1 ? 'bg-yellow-500 text-black' :
                      aluno.posicao === 2 ? 'bg-gray-400 text-black' :
                      aluno.posicao === 3 ? 'bg-amber-600 text-black' :
                      'text-gray-400'
                    }`}>
                      {aluno.posicao}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-semibold text-lg">{aluno.nome}</td>
                  <td className="px-8 py-6 text-center text-2xl font-bold text-green-400">{aluno.pontuacao}</td>
                  <td className="px-8 py-6 text-center font-mono text-gray-300">{formatarTempo(aluno.tempoConclusaoMs)}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      aluno.finalizado ? 'bg-blue-900 text-blue-200' : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {aluno.finalizado ? 'Finalizado' : 'Em Jogo'}
                    </span>
                  </td>
                </tr>
              ))}
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">
                    Nenhum jogador registrado ainda. Seja o primeiro!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
