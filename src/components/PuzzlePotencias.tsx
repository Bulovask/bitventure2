"use client";

import { useFaseLogic } from "../hooks/useFaseLogic";
import { useState, useEffect, useMemo, useRef } from "react";

interface Props {
  numeroObjetivo: number;
  onAcerto: (basePontos: number, tempoMs: number, erros: number, resposta: string) => void;
  pontos: number;
}

export default function PuzzlePotencias({ numeroObjetivo, onAcerto, pontos }: Props) {
  // Pegamos 'erros' do hook para monitorar o limite
  const { erros, registrarErro, finalizarFase } = useFaseLogic(onAcerto);
  const [bits, setBits] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [sucesso, setSucesso] = useState(false);
  const [erroCritico, setErroCritico] = useState(false);

  const pesos = useMemo(() => [7, 6, 5, 4, 3, 2, 1, 0], []);
  const valoresDecimais = useMemo(
    () => pesos.map((p) => Math.pow(2, p)),
    [pesos],
  );

  const somaAtual = bits.reduce(
    (acc, bit, i) => (bit === 1 ? acc + valoresDecimais[i] : acc),
    0,
  );
  
  const binarioAtual = bits.join('');

  const toggleBit = (index: number) => {
    if (sucesso || erroCritico) return;
    const novosBits = [...bits];
    novosBits[index] = novosBits[index] === 0 ? 1 : 0;
    setBits(novosBits);
  };

  const finalizarRef = useRef(finalizarFase);
  useEffect(() => {
    finalizarRef.current = finalizarFase;
  }, [finalizarFase]);

  useEffect(() => {
    // 1. Lógica de Vitória
    if (somaAtual === numeroObjetivo && somaAtual !== 0 && !sucesso) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSucesso(true);
      setTimeout(() => finalizarRef.current(pontos, binarioAtual), 1500);
      return;
    }

    // 2. Lógica de Erro (Estouro de Capacidade)
    if (somaAtual > numeroObjetivo && !sucesso && !erroCritico) {
      registrarErro();
      setErroCritico(true);

      // CORREÇÃO: Reseta os bits imediatamente para evitar o loop de erros
      setBits([0, 0, 0, 0, 0, 0, 0, 0]);

      // Se atingiu o limite de 3 erros, finaliza a fase com 0 pontos após o efeito
      if (erros + 1 >= 3) {
        setTimeout(() => finalizarRef.current(0, binarioAtual), 1000);
      } else {
        // Se ainda tem vidas, apenas reseta o alerta visual após 500ms
        setTimeout(() => setErroCritico(false), 500);
      }
    }
  }, [somaAtual, numeroObjetivo, sucesso, erroCritico, erros, registrarErro, binarioAtual]);

  return (
    <div
      className={`flex flex-col items-center gap-6 p-6 border-2 transition-all duration-300 rounded-lg w-full ${
        sucesso
          ? "border-green-600 bg-green-50 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          : erroCritico
            ? "border-red-500 bg-red-50 animate-shake" // Adicione essa animação no seu CSS/Tailwind
            : "border-green-300 bg-white"
      }`}
    >
      <div className="text-center space-y-1 w-full relative">
        {/* Contador de Erros/Vidas */}
        <div className="absolute top-0 right-0 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < erros ? "bg-red-500" : "bg-green-200"}`}
            />
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-widest text-green-800 font-bold">
          {erroCritico
            ? "[ ALERTA: SOBRECARGA_DETECTADA ]"
            : "[ MODO: ARQUITETURA_DE_BASE ]"}
        </p>
        <h2
          className={`text-4xl font-black transition-colors ${
            sucesso
              ? "text-green-700"
              : erroCritico
                ? "text-red-650"
                : "text-zinc-950"
          }`}
        >
          OBJETIVO: {numeroObjetivo}
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {pesos.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`flex font-mono text-sm transition-colors ${bits[i] === 1 ? "text-green-800 font-bold" : "text-green-955"}`}
            >
              <span>2</span>
              <span className="text-[10px] -mt-1 font-bold">{p}</span>
            </div>

            <button
              onClick={() => toggleBit(i)}
              disabled={sucesso || erros >= 3}
              className={`w-12 h-16 md:w-14 md:h-20 flex flex-col items-center justify-center transition-all border-2 cursor-pointer ${
                bits[i] === 1
                  ? "bg-green-600 border-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                  : "bg-zinc-50 border-green-300 text-green-750 hover:border-green-600"
              } ${erroCritico && bits[i] === 1 ? "border-red-500 text-red-600 bg-red-50" : ""}`}
            >
              <span className="text-2xl font-black">{bits[i]}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="w-full h-2 bg-zinc-150 rounded-full overflow-hidden border border-green-200">
        <div
          className={`h-full transition-all duration-500 ${erroCritico ? "bg-red-500" : "bg-green-650 shadow-[0_0_10px_#16a34a]"}`}
          style={{
            width: `${Math.min((somaAtual / numeroObjetivo) * 100, 100)}%`,
          }}
        />
      </div>

      <div
        className={`text-[10px] uppercase font-mono italic font-bold ${erroCritico ? "text-red-600" : "text-green-800"}`}
      >
        {sucesso
          ? "Estrutura binária validada."
          : erroCritico
            ? `Erro de Paridade: ${somaAtual} excede o limite!`
            : `Carga Atual: ${somaAtual} / ${numeroObjetivo}`}
      </div>
    </div>
  );
}
