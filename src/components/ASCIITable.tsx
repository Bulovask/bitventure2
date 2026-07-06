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
      <div className="w-full max-w-2xl bg-blue-50/35 border-2 border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.15)] rounded-lg overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="p-3 border-b-2 border-blue-200 bg-blue-100/50 flex justify-between items-center">
          <span className="text-blue-800 font-mono font-bold text-xs uppercase tracking-widest">
            [ MANUAL_REFERENCIA: TABELA_ASCII ]
          </span>
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-850 font-black cursor-pointer text-sm"
          >
            X
          </button>
        </div>

        {/* Grade da Tabela */}
        <div className="p-4 overflow-y-auto grid grid-cols-3 md:grid-cols-6 gap-2 font-mono text-base bg-white/80 border border-blue-100/40 rounded mx-4 my-3 max-h-[350px]">
          {/* Números */}
          {numeros.map((n) => (
            <div
              key={n}
              className="flex justify-between py-1.5 px-2 border border-blue-100/50 bg-blue-50/40 rounded shadow-xs"
            >
              <span className="text-blue-800 font-bold">{n}</span>
              <span className="text-zinc-900 font-bold">
                {String.fromCharCode(n)}
              </span>
            </div>
          ))}
          {/* Espaçador visual */}
          <div className="col-span-full border-t border-blue-200/60 my-2"></div>
          {/* Letras */}
          {letras.map((l) => (
            <div
              key={l}
              className="flex justify-between py-1.5 px-2 border border-blue-100/50 bg-blue-50/40 rounded hover:bg-blue-100/30 transition-colors shadow-xs"
            >
              <span className="text-blue-800 font-bold">{l}</span>
              <span className="text-zinc-900 font-bold">
                {String.fromCharCode(l)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t-2 border-blue-200 bg-blue-50/60">
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
      className="px-3 py-1 border border-blue-600 text-blue-600 text-xs hover:bg-blue-600 hover:text-white transition-all font-mono animate-pulse cursor-pointer rounded"
    >
      [ ? ] CONSULTAR_ASCII
    </button>
  );
}
