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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border-2 border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.15)] overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="p-3 border-b-2 border-blue-200 bg-blue-50/50 flex justify-between items-center">
          <span className="text-blue-700 font-mono font-bold text-xs uppercase tracking-widest">
            [ MANUAL_REFERENCIA: TABELA_ASCII ]
          </span>
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 font-black cursor-pointer"
          >
            X
          </button>
        </div>

        {/* Grade da Tabela */}
        <div className="p-4 overflow-y-auto grid grid-cols-3 md:grid-cols-6 gap-2 font-mono text-base bg-white">
          {/* Números */}
          {numeros.map((n) => (
            <div
              key={n}
              className="flex justify-between py-1 px-2 border border-blue-100 bg-zinc-50"
            >
              <span className="text-blue-800 font-bold">{n}</span>
              <span className="text-zinc-900 font-bold">
                {String.fromCharCode(n)}
              </span>
            </div>
          ))}
          {/* Espaçador visual */}
          <div className="col-span-full border-t border-blue-200 my-2"></div>
          {/* Letras */}
          {letras.map((l) => (
            <div
              key={l}
              className="flex justify-between py-1 px-2 border border-blue-100 bg-zinc-50 hover:bg-blue-50 transition-colors"
            >
              <span className="text-blue-800 font-bold">{l}</span>
              <span className="text-zinc-900 font-bold">
                {String.fromCharCode(l)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t-2 border-blue-200 bg-zinc-50">
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
      className="px-3 py-1 border border-blue-600 text-blue-600 text-xs hover:bg-blue-600 hover:text-white transition-all font-mono animate-pulse cursor-pointer"
    >
      [ ? ] CONSULTAR_ASCII
    </button>
  );
}
