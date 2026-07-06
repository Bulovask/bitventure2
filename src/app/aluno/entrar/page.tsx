'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJogoStore } from "@/src/store/useGameStore";
import { TerminalTitle, TerminalButton } from "@/src/components/UI";

export default function EntrarPartida() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setNomeStore = useJogoStore((state) => state.setNome);
  const setTela = useJogoStore((state) => state.setTela);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/aluno', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao entrar na partida');
      }

      // Armazena dados do aluno para persistência na sessão
      localStorage.setItem('bitventure_aluno', JSON.stringify(data));
      
      // Atualiza o Zustand Store
      setNomeStore(data.nome);
      setTela('fases');

      // Redireciona para a tela de jogo
      router.push('/aluno/jogo');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-green-800 font-mono p-4">
      <div className="max-w-md w-full bg-emerald-50/45 border-2 border-emerald-300 rounded-lg p-6 md:p-8 flex flex-col gap-6 relative shadow-[0_0_40px_rgba(16,185,129,0.06)]">
        
        {/* Cabeçalho do Terminal Decoração */}
        <div className="flex justify-between border-b border-emerald-250 pb-2 mb-2 text-[10px] uppercase tracking-widest text-emerald-950 select-none">
          <div>[ DISPOSITIVO: TERMINAL_DISCENTE ]</div>
          <div className="animate-pulse">● CONECTADO</div>
        </div>

        <div className="space-y-2">
          <TerminalTitle 
            title="BITVENTURE 2" 
            subtitle="INICIALIZAÇÃO DO CONTEXTO DE AVALIAÇÃO" 
          />
          <p className="text-xs text-emerald-900 uppercase">
            Por favor, identifique-se para carregar os módulos de numeração binária, caracteres e decodificação ASCII.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-xs uppercase tracking-widest text-emerald-950 font-bold">
              [ NOME_DO_ALUNO ]
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="DIGITE_AQUI..."
              required
              disabled={loading}
              className="w-full bg-white border-2 border-emerald-300 p-4 text-center text-xl font-mono text-emerald-800 focus:outline-none focus:border-emerald-600 transition-all uppercase placeholder-emerald-300"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-650 p-3 rounded border border-red-300 text-xs font-mono uppercase tracking-wider">
              [ ERRO_DE_CONEXÃO: {error} ]
            </div>
          )}

          <TerminalButton
            label={loading ? "CONECTANDO..." : "INICIAR_PARTIDA"}
            type="submit"
            disabled={loading || !nome.trim()}
            className="w-full px-4 text-xs md:text-sm"
          />
        </form>

        <div className="mt-4 pt-4 border-t border-emerald-200 text-center">
          <p className="text-[9px] text-emerald-950 uppercase tracking-widest select-none">
            PROGRAMA DE INICIAÇÃO À DOCÊNCIA — PIBID COMPUTAÇÃO
          </p>
        </div>
      </div>
    </main>
  );
}
