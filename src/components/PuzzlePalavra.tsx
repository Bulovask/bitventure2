"use client";

import { useState, useEffect, useRef } from 'react';
import { TerminalButton } from './UI';
import { useFaseLogic } from "../hooks/useFaseLogic";

interface Props {
  enunciado: string;
  respostaCorreta: string;
  tipo: 'BINARIO_PALAVRA' | 'DECIMAL_PALAVRA';
  onAcerto: (basePontos: number, tempoMs: number, erros: number, resposta: string) => void;
  pontos: number;
}

export default function PuzzlePalavra({ enunciado, respostaCorreta, tipo, onAcerto, pontos }: Props) {
  const { erros, registrarErro, finalizarFase } = useFaseLogic(onAcerto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWord, setInputWord] = useState('');
  const [erro, setErro] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const codigos = enunciado.split(' ');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const finalizarRef = useRef(finalizarFase);
  useEffect(() => {
    finalizarRef.current = finalizarFase;
  }, [finalizarFase]);

  const verificarResposta = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sucesso || erro) return;

    if (inputWord.trim().toUpperCase() === respostaCorreta.trim().toUpperCase()) {
      setSucesso(true);
      setErro(false);
      setTimeout(() => finalizarRef.current(pontos, inputWord.trim().toUpperCase()), 1500); 
    } else {
      registrarErro(); 
      setErro(true);
      setInputWord('');

      if (erros + 1 >= 3) {
        setTimeout(() => finalizarRef.current(0, inputWord.trim().toUpperCase()), 1000);
      } else {
        setTimeout(() => {
          setErro(false);
          inputRef.current?.focus();
        }, 800);
      }
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 p-6 border-2 transition-all duration-300 rounded-lg relative w-full ${
      sucesso 
        ? 'border-yellow-600 bg-yellow-100/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' 
        : erro 
        ? 'border-red-500 bg-red-50 animate-shake'
        : 'border-amber-300 bg-amber-50/20 shadow-sm'
    }`}>
      
      {/* Indicador de Vidas (Erros) */}
      <div className="absolute top-4 right-4 flex gap-1.5 bg-white/60 border border-amber-100 p-1 rounded-full px-2">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < erros ? 'bg-red-550 shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'bg-amber-350'
            }`} 
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
          erro ? 'text-red-650' : 'text-amber-700'
        }`}>
          {erro ? '[ ALERTA: PALAVRA_CORROMPIDA ]' : tipo === 'BINARIO_PALAVRA' ? '[ MODO: DECODIFICADOR_DE_PALAVRA_BINARIA ]' : '[ MODO: DECODIFICADOR_DE_PALAVRA_DECIMAL ]'}
        </p>
        <h2 className="text-sm text-zinc-950 opacity-80 italic font-mono uppercase">
          Traduza os códigos para revelar a palavra oculta:
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full bg-white/40 p-3 rounded-lg border border-amber-100 shadow-sm">
        {codigos.map((cod, i) => (
          <div key={i} className="flex flex-col items-center gap-1 bg-amber-50/60 border border-amber-200 p-2.5 rounded-md min-w-[75px] shadow-sm">
            <span className="text-[9px] font-mono text-amber-900/60 font-bold">Char {i + 1}</span>
            <span className="text-sm font-black font-mono text-amber-850 tracking-wider">{cod}</span>
          </div>
        ))}
      </div>

      <form onSubmit={verificarResposta} className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2">
          <label className={`text-[10px] font-mono uppercase transition-colors ${erro ? 'text-red-650' : 'text-amber-800'}`}>
            {erro ? 'ENTRADA_INVÁLIDA' : 'Palavra Decodificada:'}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputWord}
            disabled={sucesso || (erros >= 3)}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder='MENSAGEM_?'
            className={`uppercase w-full h-14 bg-white border-2 text-center text-2xl font-mono focus:outline-none transition-all rounded-md ${
              erro ? 'border-red-500 text-red-600 focus:border-red-600' : 'border-amber-300 focus:border-amber-550 text-amber-850 font-bold'
            } ${sucesso ? 'border-yellow-600 text-yellow-800 bg-yellow-50/50' : ''}`}
          />
        </div>

        <TerminalButton 
          label={sucesso ? "PALAVRA_VALIDADA" : erro ? "ERRO_DE_DECODIFICAÇÃO" : "SUBMETER_RESPOSTA"} 
          type="submit"
          disabled={sucesso || !inputWord || erro || (erros >= 3)}
          className="w-full"
        />
      </form>
    </div>
  );
}
