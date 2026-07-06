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

  const carregarRanking = async () => {
    try {
      const res = await fetch('/api/ranking');
      const data = await res.json();
      setRanking(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRanking();

    const intervalo = window.setInterval(() => {
      carregarRanking();
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, []);

  const formatarTempo = (msStr: string | null) => {
    if (!msStr) return '--:--';
    const ms = parseInt(msStr);
    const segundosTotais = Math.floor(ms / 1000);
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 text-zinc-900 p-8 flex items-center justify-center font-mono">Carregando Ranking...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-orange-600">
            Ranking Global
          </h1>
          <Link href="/" className="bg-zinc-200 hover:bg-zinc-300 px-6 py-2 rounded-lg border border-zinc-300 text-zinc-900 transition-colors cursor-pointer">
            Voltar para Início
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-zinc-100 text-zinc-650 uppercase text-sm">
              <tr>
                <th className="px-8 py-5">#</th>
                <th className="px-8 py-5">Nome</th>
                <th className="px-8 py-5 text-center">Pontuação</th>
                <th className="px-8 py-5 text-center">Tempo</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {ranking.map((aluno) => (
                <tr key={aluno.posicao} className={`hover:bg-zinc-50 transition-colors ${aluno.posicao === 1 ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      aluno.posicao === 1 ? 'bg-yellow-500 text-white' :
                      aluno.posicao === 2 ? 'bg-zinc-300 text-zinc-800' :
                      aluno.posicao === 3 ? 'bg-amber-600 text-white' :
                      'text-zinc-500'
                    }`}>
                      {aluno.posicao}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-semibold text-lg text-zinc-900">{aluno.nome}</td>
                  <td className="px-8 py-6 text-center text-2xl font-bold text-green-700">{aluno.pontuacao}</td>
                  <td className="px-8 py-6 text-center font-mono text-zinc-700">{formatarTempo(aluno.tempoConclusaoMs)}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      aluno.finalizado ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {aluno.finalizado ? 'Finalizado' : 'Em Jogo'}
                    </span>
                  </td>
                </tr>
              ))}
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-400 italic">
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
