'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function JogoPage() {
  const [aluno, setAluno] = useState<any>(null);
  const [questao, setQuestao] = useState<any>(null);
  const [resposta, setResposta] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [concluido, setConcluido] = useState(false);
  const [dadosFinais, setDadosFinais] = useState<any>(null);
  const router = useRouter();
  const finalizandoRef = useRef(false);

  const finalizarPartida = useCallback(async (alunoId: number) => {
    if (finalizandoRef.current) return;
    finalizandoRef.current = true;
    
    try {
      const res = await fetch('/api/aluno/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId })
      });
      const data = await res.json();
      setDadosFinais(data);
      setConcluido(true);
    } catch (err) {
      console.error('Erro ao finalizar partida', err);
    }
  }, []);

  const buscarProximaQuestao = useCallback(async (alunoId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questoes/proxima?alunoId=${alunoId}`);
      const data = await res.json();
      
      if (data.concluido) {
        await finalizarPartida(alunoId);
      } else {
        setQuestao(data.questao);
        setResposta('');
        setFeedback(null);
      }
    } catch (err) {
      console.error('Erro ao buscar questão', err);
    } finally {
      setLoading(false);
    }
  }, [finalizarPartida]);

  useEffect(() => {
    const stored = localStorage.getItem('bitventure_aluno');
    if (!stored) {
      router.push('/aluno/entrar');
      return;
    }
    const alunoData = JSON.parse(stored);
    setAluno(alunoData);
    buscarProximaQuestao(alunoData.id);
  }, [router, buscarProximaQuestao]);

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resposta.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/questoes/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: aluno.id,
          questaoId: questao.id,
          resposta: resposta.trim()
        })
      });
      const data = await res.json();
      
      setFeedback(data);
      
      if (data.correta) {
        setAluno((prev: any) => ({
          ...prev,
          pontuacao: (prev.pontuacao || 0) + data.pontosGanhos
        }));
      }

      setTimeout(() => {
        buscarProximaQuestao(aluno.id);
      }, 1500);

    } catch (err) {
      console.error('Erro ao responder', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarTempo = (ms: number) => {
    if (!ms) return '0s';
    const totalSegundos = Math.floor(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    
    if (minutos > 0) {
      return `${minutos}min ${segundos}s`;
    }
    return `${segundos}s`;
  };

  if (!aluno) return <div className="p-8 text-black">Carregando...</div>;

  if (concluido && dadosFinais) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-black">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="mb-4 inline-block p-3 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Desafio Concluído!</h1>
          <p className="text-gray-500 mb-8">Parabéns, {aluno.nome}! Veja seu desempenho:</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-400 uppercase font-bold mb-1">Pontuação</p>
              <p className="text-3xl font-black text-blue-600">{dadosFinais.pontuacao}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-400 uppercase font-bold mb-1">Tempo Total</p>
              <p className="text-2xl font-black text-purple-600">
                {formatarTempo(Number(dadosFinais.tempoConclusaoMs))}
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              localStorage.removeItem('bitventure_aluno');
              router.push('/aluno/entrar');
            }}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
          >
            Jogar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <header className="max-w-2xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{aluno.nome}</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            {questao ? `Nível ${questao.nivel}` : 'Processando...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-gray-400 font-semibold tracking-tighter">Pontuação</p>
          <p className="text-2xl font-black text-blue-600">{aluno.pontuacao || 0}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md">
          {questao ? (
            <form onSubmit={handleResponder} className="space-y-8">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Desafio</p>
                <div className="bg-gray-900 text-green-400 p-8 rounded-lg font-mono text-4xl shadow-inner break-all">
                  {questao.enunciado}
                </div>
                <p className="text-gray-500 italic">
                  {questao.tipo.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  disabled={loading || !!feedback}
                  placeholder="Sua resposta aqui..."
                  className="w-full px-6 py-4 text-center text-2xl border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors font-bold"
                  autoFocus
                />

                {feedback && (
                  <div className={`text-center p-4 rounded-lg font-bold text-xl ${
                    feedback.correta ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {feedback.correta ? '✨ Correto! +10 pontos' : '❌ Incorreto!'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !resposta.trim() || !!feedback}
                  className={`w-full py-4 rounded-xl text-white font-bold text-xl shadow-lg transition-all ${
                    loading || !resposta.trim() || !!feedback
                      ? 'bg-gray-300'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                  }`}
                >
                  {loading && !feedback ? 'Processando...' : 'Enviar Resposta'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Processando sua jornada...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
