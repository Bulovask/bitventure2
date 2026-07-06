"use client";

import { useFaseLogic } from "../hooks/useFaseLogic";
import { useState, useEffect, useRef } from "react";

interface PuzzleProps {
  numeroObjetivo: number;
  onAcerto: (basePontos: number, tempoMs: number, erros: number, resposta: string) => void;
  pontos: number;
}

export default function PuzzleBinario({ numeroObjetivo, onAcerto, pontos }: PuzzleProps) {
  const { erros, registrarErro, finalizarFase } = useFaseLogic(onAcerto);
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [sucesso, setSucesso] = useState(false);
  const [erroCritico, setErroCritico] = useState(false);

  const valores = [128, 64, 32, 16, 8, 4, 2, 1];

  const somaAtual = bits.reduce(
    (acc, bit, i) => (bit === 1 ? acc + valores[i] : acc),
    0,
  );
  
  const binarioAtual = bits.join('');
  const parcelasAtivas = valores.filter((_, i) => bits[i] === 1);

  const toggleBit = (index: number) => {
    if (sucesso || erroCritico) return;
    setBits((prev) => {
      const novosBits = [...prev];
      novosBits[index] = novosBits[index] === 0 ? 1 : 0;
      return novosBits;
    });
  };

  const finalizarRef = useRef(finalizarFase);
  useEffect(() => {
    finalizarRef.current = finalizarFase;
  }, [finalizarFase]);

  useEffect(() => {
    // 1. Lógica de Vitória
    if (somaAtual === numeroObjetivo && somaAtual !== 0 && !sucesso) {
      setSucesso(true);
      setTimeout(() => finalizarRef.current(pontos, binarioAtual), 1500);
      return;
    }

    // 2. Lógica de Erro (Estouro de Capacidade)
    if (somaAtual > numeroObjetivo && !sucesso && !erroCritico) {
      registrarErro();
      setErroCritico(true);

      // CORREÇÃO: Reseta os bits para evitar queimar as 3 vidas no mesmo erro
      setBits([0, 0, 0, 0, 0, 0, 0, 0]);

      if (erros + 1 >= 3) {
        // Se atingiu o limite, avança com 0 pontos
        setTimeout(() => finalizarRef.current(0, binarioAtual), 1000);
      } else {
        // Reseta o feedback visual após 1 segundo
        setTimeout(() => setErroCritico(false), 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [somaAtual, numeroObjetivo, sucesso, erroCritico, erros]);

  return (
    <div
      className={`flex flex-col items-center gap-8 p-6 transition-all duration-300 border-2 rounded-lg relative w-full ${
        sucesso
          ? "bg-green-50 border-green-600 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
          : erroCritico
          ? "bg-red-50 border-red-500 animate-shake"
          : "bg-white border-green-300"
      }`}
    >
      {/* Contador de Vidas (Erros) */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < erros ? 'bg-red-500' : 'bg-green-200'
            }`} 
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors ${
          sucesso ? "text-green-700" : erroCritico ? "text-red-650" : "text-green-800"
        }`}>
          {sucesso ? "[ STATUS: DECODIFICADO ]" : erroCritico ? "[ ALERTA: SOBRECARGA ]" : "Objetivo_Decimal"}
        </p>
        <h2 className={`text-6xl font-black transition-all duration-300 ${
          sucesso ? "text-green-700 scale-105" : erroCritico ? "text-red-600" : "text-zinc-950"
        }`}>
          {numeroObjetivo}
        </h2>
      </div>

      <div className={`w-full p-4 border-y transition-all duration-300 min-h-16 flex items-center justify-center font-mono ${
        sucesso ? "bg-green-50 border-green-300" : erroCritico ? "bg-red-50 border-red-200" : "bg-zinc-50 border-green-200"
      }`}>
        <p className={`text-xl transition-colors ${sucesso ? "text-zinc-900 font-bold" : erroCritico ? "text-red-700" : "text-green-700"}`}>
          {parcelasAtivas.length > 0 ? (
            <>
              {parcelasAtivas.join(" + ")} ={" "}
              <span className="font-bold underline">{somaAtual}</span>
            </>
          ) : (
            <span className="text-zinc-450 opacity-50">000 + 000 = 0</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {bits.map((bit, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className={`text-[10px] font-bold transition-colors ${
              sucesso ? "text-green-700" : erroCritico ? "text-red-750" : "text-green-850"
            }`}>
              {valores[i]}
            </span>
            <button
              onClick={() => toggleBit(i)}
              disabled={sucesso || erroCritico}
              className={`w-12 h-16 md:w-14 md:h-20 flex items-center justify-center text-2xl font-black transition-all duration-200 border-2 cursor-pointer ${
                bit === 1
                  ? "bg-green-600 border-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  : "bg-zinc-50 border-green-300 text-green-750 hover:border-green-600"
              } ${erroCritico && bit === 1 ? "border-red-500 text-red-650 bg-red-50" : ""}`}
            >
              {bit}
            </button>
          </div>
        ))}
      </div>

      <div className={`text-[10px] uppercase font-medium tracking-tight transition-colors ${
        erroCritico ? "text-red-600 animate-pulse" : "text-green-800"
      }`}>
        {sucesso
          ? "Aguardando sincronização de dados..."
          : erroCritico 
          ? `Sistema instável: valor ${somaAtual} excedeu a capacidade!`
          : "Instrução: Ative os bits (1) para realizar a soma binária."}
      </div>
    </div>
  );
}
