"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { TerminalButton } from "./UI";
import { useFaseLogic } from "../hooks/useFaseLogic";

interface PuzzleProps {
  numeroObjetivo: number;
  onAcerto: (basePontos: number, tempoMs: number, erros: number, resposta: string) => void;
  mostrarDica?: boolean;
  pontos: number;
  questaoTipo: string;
  questaoEnunciado: string;
}

export default function PuzzleDecimal({
  numeroObjetivo,
  onAcerto,
  pontos,
  mostrarDica = true,
  questaoTipo,
  questaoEnunciado,
}: PuzzleProps) {
  // 1. Pegamos 'erros' para controlar o limite de 3
  const { erros, registrarErro, finalizarFase } = useFaseLogic(onAcerto);

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValor, setInputValor] = useState("");
  const [erro, setErro] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const bitsGerados = useMemo(() => {
    
    // return questaoEnunciado.padStart(8, "0").split("").map(Number);    
    return numeroObjetivo.toString(2).padStart(8, "0").split("").map(Number);
  }, [numeroObjetivo, questaoTipo, questaoEnunciado]);

  const finalizarRef = useRef(finalizarFase);
  useEffect(() => {
    finalizarRef.current = finalizarFase;
  }, [finalizarFase]);

  const verificarResposta = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sucesso || erro) return;

    if (parseInt(inputValor) === numeroObjetivo) {
      setSucesso(true);
      setErro(false);
      setTimeout(() => finalizarRef.current(pontos, inputValor), 1500);
    } else {
      registrarErro();
      setErro(true);
      setInputValor("");

      // 2. Lógica de Limite de Erros
      if (erros + 1 >= 3) {
        // Se atingiu o limite, finaliza com 0 pontos após o efeito visual
        setTimeout(() => finalizarRef.current(0, inputValor), 1000);
      } else {
        // O efeito shake dura 500ms, depois permite tentar de novo
        setTimeout(() => {
          setErro(false);
          inputRef.current?.focus();
        }, 800);
      }
    }
  };

  const valoresPosicionais = [128, 64, 32, 16, 8, 4, 2, 1];

  return (
    <div
      className={`flex flex-col items-center gap-6 p-6 border-2 transition-all duration-500 rounded-lg relative w-full ${
        sucesso
          ? "border-green-400 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
          : erro
          ? "border-red-600 bg-red-900/20 animate-shake"
          : "border-green-900 bg-zinc-900/30"
      }`}
    >
      {/* 3. Indicador de Vidas (Erros) */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < erros ? 'bg-red-600 shadow-[0_0_8px_red]' : 'bg-green-900/40'
            }`} 
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
          erro ? "text-red-500" : "text-green-700"
        }`}>
          {erro ? "[ ALERTA: PARIDADE_INCÓRRETA ]" : "[ MODO: DECODIFICAÇÃO_INVERSA ]"}
        </p>
        <h2 className="text-sm text-white opacity-80 italic uppercase font-mono">
          Traduza o sinal de bits para decimal:
        </h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
        {bitsGerados.map((bit, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span
              className={`text-[9px] font-mono font-bold transition-all duration-500 ${
                mostrarDica ? "opacity-100" : "opacity-0"
              } ${bit === 1 && !sucesso && !erro ? "text-green-400" : "text-green-900"}`}
            >
              {valoresPosicionais[i]}
            </span>

            <div
              className={`w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-2xl font-black border-2 transition-all ${
                bit === 1
                  ? erro 
                    ? "border-red-500 text-red-500 bg-red-900/20" 
                    : "border-green-400 text-green-400 bg-green-900/40 shadow-[inset_0_0_10px_rgba(74,222,128,0.2)]"
                  : "border-zinc-800 text-zinc-800 bg-black/20"
              }`}
            >
              {bit}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={verificarResposta} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="number"
            value={inputValor}
            disabled={sucesso || (erros >= 3)}
            onChange={(e) => setInputValor(e.target.value)}
            placeholder="RESPOSTA_?"
            className={`w-full bg-black border-2 p-4 text-center text-3xl font-mono focus:outline-none transition-all ${
              erro
                ? "border-red-600 text-red-500"
                : "border-green-900 focus:border-green-500 text-green-400"
            } ${sucesso ? "border-green-400 text-white" : ""}`}
          />
        </div>

        <TerminalButton
          label={sucesso ? "CONVERSÃO_CONCLUÍDA" : erro ? "ERRO_DE_SISTEMA" : "VERIFICAR_INTEGRIDADE"}
          type="submit"
          disabled={sucesso || !inputValor || erro || (erros >= 3)}
          className="w-full px-4 text-xs md:text-sm"
        />
      </form>

      <div className={`text-[10px] uppercase font-medium h-4 transition-colors ${erro ? "text-red-500 animate-pulse" : "text-green-900"}`}>
        {!sucesso && !erro && mostrarDica && "Dica: Some os pesos superiores dos bits ativos."}
        {erro && `Tentativa ${erros}/3 falhou. Recalcule os bits ativos.`}
        {sucesso && "Acesso concedido. Sincronizando..."}
      </div>
    </div>
  );
}
