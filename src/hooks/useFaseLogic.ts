import { useState, useEffect, useRef, useCallback } from 'react';

export function useFaseLogic(onAcerto: (basePontos: number, tempo: number, erros: number, resposta: string) => void) {
  // 1. O estado já nasce como 0. Toda vez que a fase mudar e o componente
  // for remontado, ele voltará a ser 0 naturalmente.
  const [erros, setErros] = useState(0);

  const tempoInicio = useRef<number | null>(null);

  useEffect(() => {
    // 2. Mantenha apenas o que é externo/lateral (como o tempo do sistema)
    tempoInicio.current = Date.now();

    return () => {
      tempoInicio.current = null;
    };
  }, []); // Rodará apenas 1 vez na montagem de cada fase

  const registrarErro = useCallback(() => {
    setErros(prev => prev + 1);
  }, []);

  const finalizarFase = useCallback((basePontos: number = 50, resposta: string) => {
    const inicio = tempoInicio.current ?? Date.now();
    const tempoGasto = Date.now() - inicio;

    onAcerto(basePontos, tempoGasto, erros, resposta);
  }, [onAcerto, erros]);

  return { erros, registrarErro, finalizarFase };
}
