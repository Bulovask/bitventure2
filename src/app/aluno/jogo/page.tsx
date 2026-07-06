'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJogoStore } from "@/src/store/useGameStore";
import Fases from "@/src/components/Fases";
import Resultados from "@/src/components/Resultados";

export default function JogoPage() {
  const router = useRouter();
  const { nome, telaAtiva, setTela, desbloquearSistema } = useJogoStore();

  useEffect(() => {
    // Verifica se o aluno entrou
    const stored = localStorage.getItem('bitventure_aluno');
    if (!stored) {
      router.push('/aluno/entrar');
      return;
    }
    
    // Se o sistema estiver bloqueado, desbloqueia ao entrar no jogo
    desbloquearSistema();
  }, [router, desbloquearSistema]);

  if (!nome) return <div className="p-8 text-green-500 font-mono">Inicializando Sistema...</div>;

  return (
    <main className="min-h-screen bg-zinc-50 text-green-700 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {telaAtiva === 'fases' && <Fases />}
        {telaAtiva === 'resultados' && <Resultados />}
      </div>
    </main>
  );
}
