"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { TerminalButton } from './UI';
import { useFaseLogic } from "../hooks/useFaseLogic";

interface Props {
  letraObjetivo: string;
  onAcerto: (basePontos: number, tempoMs: number, erros: number, resposta: string) => void;
  pontos: number;
}

export default function PuzzleASCII({ letraObjetivo, onAcerto, pontos }: Props) {
  // 1. Pegamos 'erros' para controlar o limite
  const { erros, registrarErro, finalizarFase } = useFaseLogic(onAcerto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputChar, setInputChar] = useState('');
  const [erro, setErro] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const valorDecimal = useMemo(() => letraObjetivo.charCodeAt(0), [letraObjetivo]);
  
  const bitsVisual = useMemo(() => {
    return valorDecimal.toString(2).padStart(8, '0').split('').map(Number);
  }, [valorDecimal]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Referência estável para evitar resets de timer
  const finalizarRef = useRef(finalizarFase);
  useEffect(() => {
    finalizarRef.current = finalizarFase;
  }, [finalizarFase]);

  const verificarResposta = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sucesso || erro) return;

    if (inputChar.toUpperCase() === letraObjetivo.toUpperCase()) {
      setSucesso(true);
      setErro(false);
      setTimeout(() => finalizarRef.current(pontos, inputChar.toUpperCase()), 1500); 
    } else {
      // 2. Registra o erro e verifica o limite de 3
      registrarErro(); 
      setErro(true);
      setInputChar('');

      if (erros + 1 >= 3) {
        // Se atingiu o limite, avança com 0 pontos após o tremor
        setTimeout(() => finalizarRef.current(0, inputChar.toUpperCase()), 1000);
      } else {
        // Reseta o estado de erro para permitir nova tentativa
        setTimeout(() => {
          setErro(false);
          inputRef.current?.focus();
        }, 800);
      }
    }
  };

  const pesos = [128, 64, 32, 16, 8, 4, 2, 1];

  return (
    <div className={`flex flex-col items-center gap-6 p-6 border-2 transition-all duration-300 rounded-lg relative w-full ${
      sucesso 
        ? 'border-blue-500 bg-blue-100/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
        : erro 
        ? 'border-red-500 bg-red-50 animate-shake'
        : 'border-blue-300 bg-blue-50/20 shadow-sm'
    }`}>
      
      {/* 3. Indicador de Vidas (Erros) */}
      <div className="absolute top-4 right-4 flex gap-1.5 bg-white/60 border border-blue-100 p-1 rounded-full px-2">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < erros ? 'bg-red-500 shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'bg-blue-300'
            }`} 
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
          erro ? 'text-red-650' : 'text-blue-700'
        }`}>
          {erro ? '[ ALERTA: SINAL_CORROMPIDO ]' : '[ MODO: INTERPRETADOR_ASCII ]'}
        </p>
        <h2 className="text-sm text-zinc-950 opacity-80 italic font-mono uppercase font-bold">
          Converta o sinal de bits para o caractere Alfanumérico:
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-white/40 p-3 rounded-lg border border-blue-100">
        {bitsVisual.map((bit, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className={`text-[8px] font-bold ${bit === 1 ? 'text-blue-700 font-extrabold' : 'text-blue-950/60'}`}>
              {pesos[i]}
            </span>
            <div className={`w-9 h-12 flex items-center justify-center text-xl font-black border-2 transition-all rounded-md ${
              bit === 1 
                ? erro ? 'border-red-500 text-red-650 bg-red-50' : 'border-blue-500 text-blue-800 bg-blue-100 font-extrabold shadow-sm' 
                : 'border-zinc-250 text-zinc-400 bg-white'
            }`}>
              {bit}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={verificarResposta} className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2">
          <label className={`text-[10px] font-mono uppercase font-bold transition-colors ${erro ? 'text-red-650' : 'text-blue-800'}`}>
            {erro ? 'ENTRADA_INVÁLIDA' : 'Caractere Detectado:'}
          </label>
          <input
            ref={inputRef}
            type="text"
            maxLength={1}
            value={inputChar}
            disabled={sucesso || (erros >= 3)}
            onChange={(e) => setInputChar(e.target.value)}
            placeholder='?'
            className={`uppercase w-20 h-20 bg-white border-2 text-center text-5xl font-mono focus:outline-none transition-all rounded-md ${
              erro ? 'border-red-500 text-red-600 focus:border-red-600' : 'border-blue-300 focus:border-blue-600 text-blue-800 font-bold'
            } ${sucesso ? 'border-blue-500 text-blue-800 bg-blue-50/50' : ''}`}
          />
        </div>

        <TerminalButton 
          label={sucesso ? "SINAL_VALIDADO" : erro ? "ERRO_DE_DECODIFICAÇÃO" : "DECODIFICAR_SINAL"} 
          type="submit"
          disabled={sucesso || !inputChar || erro || (erros >= 3)}
          className="w-full"
        />
      </form>

      <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-md text-[9px] font-mono text-blue-900 flex gap-4 shadow-sm">
        <div className={inputChar.toUpperCase() === 'A' ? 'text-blue-800 font-extrabold' : ''}>A = 65</div>
        <div className={inputChar.toUpperCase() === 'B' ? 'text-blue-800 font-extrabold' : ''}>B = 66</div>
        <div>C = 67</div>
        <div className="text-blue-700/50 font-extrabold">...</div>
        <div className="text-blue-700 underline decoration-dotted font-bold">Tabela ASCII</div>
      </div>
    </div>
  );
}
