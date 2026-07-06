"use client";

import { useState } from "react";
import { TerminalButton } from "./UI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SomaCalculator({ isOpen, onClose }: Props) {
  const [valorA, setValorA] = useState<string>("");
  const [valorB, setValorB] = useState<string>("");
  const [resultado, setResultado] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSomar = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(valorA);
    const b = parseFloat(valorB);
    if (!isNaN(a) && !isNaN(b)) {
      setResultado(a + b);
    } else {
      setResultado(null);
    }
  };

  const handleClear = () => {
    setValorA("");
    setValorB("");
    setResultado(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white border-2 border-green-600 shadow-[0_0_30px_rgba(34,197,94,0.15)] overflow-hidden flex flex-col font-mono">
        {/* Header do Modal */}
        <div className="p-3 border-b-2 border-green-200 bg-green-50/50 flex justify-between items-center">
          <span className="text-green-700 font-bold text-xs uppercase tracking-widest">
            [ TERMINAL: CALC_SOMA ]
          </span>
          <button
            onClick={onClose}
            className="text-green-600 hover:text-green-800 font-black cursor-pointer"
          >
            X
          </button>
        </div>

        {/* Form / Inputs */}
        <form onSubmit={handleSomar} className="p-4 flex flex-col gap-4 bg-white">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-green-850 uppercase tracking-widest font-bold">
              [ ENTRADA_VALOR_A ]
            </label>
            <input
              type="number"
              step="any"
              value={valorA}
              onChange={(e) => setValorA(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-50 border border-green-200 focus:border-green-600 p-2 text-green-700 text-center text-lg focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-green-850 uppercase tracking-widest font-bold">
              [ ENTRADA_VALOR_B ]
            </label>
            <input
              type="number"
              step="any"
              value={valorB}
              onChange={(e) => setValorB(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-50 border border-green-200 focus:border-green-600 p-2 text-green-700 text-center text-lg focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="py-2 border border-zinc-300 text-zinc-650 hover:text-zinc-900 hover:border-zinc-550 text-xs font-bold uppercase transition-all duration-200 cursor-pointer"
            >
              [ LIMPAR ]
            </button>
            <button
              type="submit"
              className="py-2 bg-green-50 hover:bg-green-600 hover:text-white border border-green-600 text-green-600 text-xs font-bold uppercase transition-all duration-200 cursor-pointer"
            >
              [ SOMAR ]
            </button>
          </div>
        </form>

        {/* Display Panel */}
        <div className="mx-4 mb-4 p-3 border border-blue-200 bg-blue-50/50 rounded-sm">
          <div className="text-[9px] text-blue-700 uppercase tracking-wider mb-2 border-b border-blue-200 pb-1 flex justify-between">
            <span>STATUS_PROCESSADOR:</span>
            <span className={resultado !== null ? "text-green-600 font-bold" : "text-blue-800"}>
              {resultado !== null ? "CONCLUIDO" : "OCIOSO"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-800 text-xs font-bold">[ RESULTADO ]</span>
            <span className="text-zinc-900 font-bold text-2xl tracking-tight">
              {resultado !== null ? resultado : "---"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-green-200 bg-zinc-50">
          <TerminalButton
            label="FECHAR_CALCULADORA"
            onClick={onClose}
            className="w-full py-1 text-xs"
            type="button"
          />
        </div>
      </div>
    </div>
  );
}

export function ButtonSomaCalculatorModal({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 border border-green-600 text-green-600 text-xs hover:bg-green-600 hover:text-white transition-all font-mono animate-pulse cursor-pointer"
    >
      [ + ] CALC_SOMA
    </button>
  );
}
