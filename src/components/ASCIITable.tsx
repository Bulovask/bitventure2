"use client";

import { TerminalButton } from "./UI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ASCIITable({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  // Gerar o intervalo das letras maiúsculas (65 a 90) e números (48-57)
  const letras = Array.from({ length: 26 }, (_, i) => 65 + i);
  const numeros = Array.from({ length: 10 }, (_, i) => 48 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl  bg-zinc-900 border-2 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="p-3 border-b-2 border-blue-900 bg-blue-950/20 flex justify-between items-center">
          <span className="text-blue-400 font-mono font-bold text-xs uppercase tracking-widest">
            [ MANUAL_REFERENCIA: TABELA_ASCII ]
          </span>
          <button
            onClick={onClose}
            className="text-blue-500 hover:text-white font-black"
          >
            X
          </button>
        </div>

        {/* Grade da Tabela */}
        <div className="p-4 overflow-y-auto grid grid-cols-3 md:grid-cols-6 gap-2 font-mono text-base">
          {/* Números */}
          {numeros.map((n) => (
            <div
              key={n}
              className="flex justify-between py-1 px-2 border border-blue-900/30 bg-black/40"
            >
              <span className="text-blue-700">{n}</span>
              <span className="text-white font-bold">
                {String.fromCharCode(n)}
              </span>
            </div>
          ))}
          {/* Espaçador visual */}
          <div className="col-span-full border-t border-blue-900/50 my-2"></div>
          {/* Letras */}
          {letras.map((l) => (
            <div
              key={l}
              className="flex justify-between py-1 px-2 border border-blue-900/30 bg-black/40 hover:bg-blue-900/20 transition-colors"
            >
              <span className="text-blue-700">{l}</span>
              <span className="text-white font-bold">
                {String.fromCharCode(l)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t-2 border-blue-900 bg-black">
          <TerminalButton
            label="FECHAR_MANUAL"
            onClick={onClose}
            className="w-full py-1 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

type Props2 = {
  onClick: () => void;
}

export function ButtonASCIITableModal({onClick}: Props2) {

  return (
    <button
      onClick={onClick}
      className="px-3 py-1 border border-blue-500 text-blue-500 text-xs hover:bg-blue-500 hover:text-white transition-all font-mono animate-pulse"
    >
      [ ? ] CONSULTAR_ASCII
    </button>
  );
}
