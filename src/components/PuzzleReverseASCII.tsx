"use client";

import { useFaseLogic } from "../hooks/useFaseLogic";
import { useState, useEffect, useMemo, useRef } from "react";

interface Props {
  letraObjetivo: string;
  onAcerto: (basePontos: number, tempoMs: number, erros: number, resposta: string) => void;
  pontos: number;
}

export default function PuzzleReverseASCII({ letraObjetivo, onAcerto, pontos }: Props) {
  const { erros, registrarErro, finalizarFase } = useFaseLogic(onAcerto);
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [sucesso, setSucesso] = useState(false);
  const [erroCritico, setErroCritico] = useState(false);

  const decimalObjetivo = useMemo(() => letraObjetivo.charCodeAt(0), [letraObjetivo]);
  const pesos = [128, 64, 32, 16, 8, 4, 2, 1];

  const somaAtual = bits.reduce((acc, bit, i) => (bit === 1 ? acc + pesos[i] : acc), 0);

  const caractereAtual = useMemo(() => {
    if (somaAtual > 0 && somaAtual <= 255) return String.fromCharCode(somaAtual);
    return "?";
  }, [somaAtual]);

  const toggleBit = (index: number) => {
    if (sucesso || erroCritico) return;
    setBits((prev) => {
      const novosBits = [...prev];
      novosBits[index] = novosBits[index] === 0 ? 1 : 0;
      return novosBits;
    });
  };

  const finalizarRef = useRef(finalizarFase);
  useEffect(() => { finalizarRef.current = finalizarFase; }, [finalizarFase]);

  useEffect(() => {
    // 1. Verificação de Vitória
    if (somaAtual === decimalObjetivo && somaAtual !== 0 && !sucesso) {
      setSucesso(true);
      setTimeout(() => finalizarRef.current(pontos, caractereAtual), 1500);
      return;
    }

    // 2. Verificação de Erro (Estouro de Valor ASCII)
    if (somaAtual > decimalObjetivo && !sucesso && !erroCritico) {
      registrarErro();
      setErroCritico(true);
      
      // Reseta bits para evitar loop de erros e forçar nova tentativa
      setBits([0, 0, 0, 0, 0, 0, 0, 0]);

      if (erros + 1 >= 3) {
        setTimeout(() => finalizarRef.current(0, caractereAtual), 1000);
      } else {
        setTimeout(() => setErroCritico(false), 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [somaAtual, decimalObjetivo, sucesso, erroCritico, erros, caractereAtual]);

  return (
    <div
      className={`flex flex-col items-center gap-6 p-6 border-2 transition-all duration-300 rounded-lg relative w-full ${
        sucesso
          ? "border-purple-600 bg-purple-50 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
          : erroCritico
          ? "border-red-500 bg-red-50 animate-shake"
          : "border-green-300 bg-white"
      }`}
    >
      {/* Sistema de Vidas */}
      <div className="absolute top-4 right-4 flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < erros ? 'bg-red-500' : 'bg-purple-200'
            }`} 
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
          erroCritico ? "text-red-650" : "text-purple-750"
        }`}>
          {erroCritico ? "[ ALERTA: OVERFLOW_ASCII ]" : "[ MODO: CODIFICADOR_ASCII ]"}
        </p>
        <h2 className="text-sm text-zinc-950 opacity-80 italic font-mono uppercase">
          Gere o caractere objetivo através dos bits:
        </h2>
      </div>

      {/* Painel de Objetivo */}
      <div className={`flex gap-6 items-center border-y-2 py-2 w-full justify-center transition-colors ${
        erroCritico ? "border-red-200 bg-red-50" : "border-purple-200 bg-purple-50/50"
      }`}>
        <div className="text-center">
          <p className="text-[10px] text-purple-850 font-mono font-bold">OBJETIVO</p>
          <p className={`text-4xl font-black transition-colors ${erroCritico ? "text-red-650" : "text-zinc-950"}`}>
            {letraObjetivo}
          </p>
        </div>
        <div className="text-4xl font-light text-purple-200 opacity-50">→</div>
        <div className="text-center">
          <p className="text-[10px] text-purple-850 font-mono font-bold">DECIMAL</p>
          <p className="text-4xl font-black text-purple-750">{decimalObjetivo}</p>
        </div>
      </div>

      {/* Display em Tempo Real */}
      <div className={`text-center p-3 border rounded-md w-full max-w-sm transition-all ${
        erroCritico ? "bg-red-50 border-red-300" : "bg-zinc-50 border-purple-250"
      }`}>
        <p className="text-xs text-purple-800 font-mono">
          Soma: <span className={`text-xl font-bold ${erroCritico ? "text-red-650" : "text-zinc-950"}`}>{somaAtual}</span>
          <span className="mx-2 opacity-30">|</span>
          Char: <span className="font-bold text-2xl text-purple-750 font-sans">{caractereAtual}</span>
        </p>
      </div>

      {/* Grid de Bits */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {bits.map((bit, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className={`text-[10px] font-bold ${sucesso ? "text-purple-750" : "text-green-800"}`}>
              {pesos[i]}
            </span>
            <button
              onClick={() => toggleBit(i)}
              disabled={sucesso || erroCritico}
              className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-xl font-black transition-all border-2 cursor-pointer ${
                bit === 1
                  ? "bg-purple-650 border-purple-650 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "bg-zinc-50 border-green-300 text-green-700 hover:border-purple-600"
              } ${erroCritico && bit === 1 ? "border-red-500 text-red-650 bg-red-50" : ""}`}
            >
              {bit}
            </button>
          </div>
        ))}
      </div>

      <div className={`text-[10px] uppercase font-mono italic h-4 transition-colors ${
        erroCritico ? "text-red-650 animate-pulse" : "text-purple-850"
      }`}>
        {sucesso
          ? "Codificação aceita. Sincronizando fluxo..."
          : erroCritico 
          ? `Erro: Valor ${somaAtual} excedeu a tabela do alvo!`
          : "Dica: Cada caractere tem um código decimal único."}
      </div>
    </div>
  );
}
