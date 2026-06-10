'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EntrarPartida() {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

      // Redireciona para a tela de jogo
      router.push('/aluno/jogo');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-600">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Bitventure 2</h1>
        <p className="text-center text-gray-600 mb-8">Digite seu nome para começar o desafio!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Aluno
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João Silva"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !nome.trim()}
            className={`w-full py-3 px-4 rounded-md text-white font-bold text-lg shadow-md transition-all ${
              loading || !nome.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Entrando...' : 'Entrar na Partida'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Avaliação de Sistemas de Numeração
          </p>
        </div>
      </div>
    </div>
  );
}
