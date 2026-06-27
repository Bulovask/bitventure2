'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true);
  const [partidaEncerrada, setPartidaEncerrada] = useState(false);
  const [toggling, setToggling] = useState(false);

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

        <div className="mt-12">
           <Link href="/" className="text-blue-400 hover:underline">← Voltar para a Home</Link>
        </div>
      </div>
    </div>
  );
}
