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
        ? 'border-yellow-600 bg-yellow-50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' 
        : erro 
        ? 'border-red-500 bg-red-50 animate-shake'
        : 'border-green-300 bg-white'
    }`}>
      
      {/* Indicador de Vidas (Erros) */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < erros ? 'bg-red-500' : 'bg-yellow-250'
            }`} 
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
          erro ? 'text-red-650' : 'text-yellow-600'
        }`}>
          {erro ? '[ ALERTA: PALAVRA_CORROMPIDA ]' : tipo === 'BINARIO_PALAVRA' ? '[ MODO: DECODIFICADOR_DE_PALAVRA_BINARIA ]' : '[ MODO: DECODIFICADOR_DE_PALAVRA_DECIMAL ]'}
        </p>
        <h2 className="text-sm text-zinc-950 opacity-80 italic font-mono uppercase">
          Traduza os códigos para revelar a palavra oculta:
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full">
        {codigos.map((cod, i) => (
          <div key={i} className="flex flex-col items-center gap-1 bg-zinc-50 border border-zinc-200 p-2 rounded min-w-[70px]">
            <span className="text-[9px] font-mono text-zinc-650">Char {i + 1}</span>
            <span className="text-sm font-black font-mono text-yellow-750 tracking-wider">{cod}</span>
          </div>
        ))}
      </div>

      <form onSubmit={verificarResposta} className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2">
          <label className={`text-[10px] font-mono uppercase transition-colors ${erro ? 'text-red-650' : 'text-yellow-800'}`}>
            {erro ? 'ENTRADA_INVÁLIDA' : 'Palavra Decodificada:'}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputWord}
            disabled={sucesso || (erros >= 3)}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder='MENSAGEM_?'
            className={`uppercase w-full h-14 bg-zinc-50 border-2 text-center text-2xl font-mono focus:outline-none transition-all ${
              erro ? 'border-red-500 text-red-600' : 'border-yellow-300 focus:border-yellow-500 text-yellow-700'
            } ${sucesso ? 'border-yellow-600 text-yellow-700 bg-yellow-50' : ''}`}
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
