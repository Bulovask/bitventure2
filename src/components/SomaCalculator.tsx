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
      <div className="w-full max-w-sm bg-emerald-50/35 border-2 border-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.15)] rounded-lg overflow-hidden flex flex-col font-mono">
        {/* Header do Modal */}
        <div className="p-3 border-b-2 border-emerald-200 bg-emerald-100/50 flex justify-between items-center">
          <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest">
            [ TERMINAL: CALC_SOMA ]
          </span>
          <button
            onClick={onClose}
            className="text-emerald-600 hover:text-emerald-800 font-black cursor-pointer text-sm"
          >
            X
          </button>
        </div>

        {/* Form / Inputs */}
        <form onSubmit={handleSomar} className="p-4 flex flex-col gap-4 bg-white/70 mx-3 my-2 border border-emerald-100/60 rounded">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-emerald-850 uppercase tracking-widest font-bold">
              [ ENTRADA_VALOR_A ]
            </label>
            <input
              type="number"
              step="any"
              value={valorA}
              onChange={(e) => setValorA(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-emerald-300 focus:border-emerald-650 p-2 text-emerald-800 text-center text-lg focus:outline-none transition-colors rounded"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-emerald-850 uppercase tracking-widest font-bold">
              [ ENTRADA_VALOR_B ]
            </label>
            <input
              type="number"
              step="any"
              value={valorB}
              onChange={(e) => setValorB(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-emerald-300 focus:border-emerald-650 p-2 text-emerald-800 text-center text-lg focus:outline-none transition-colors rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="py-2 border border-zinc-300 text-zinc-700 bg-zinc-50 hover:bg-zinc-150 hover:border-zinc-400 text-xs font-bold uppercase transition-all duration-200 cursor-pointer rounded"
            >
              [ LIMPAR ]
            </button>
            <button
              type="submit"
              className="py-2 bg-emerald-100 hover:bg-emerald-600 hover:text-white border border-emerald-650 text-emerald-800 text-xs font-bold uppercase transition-all duration-200 cursor-pointer rounded"
            >
              [ SOMAR ]
            </button>
          </div>
        </form>

        {/* Display Panel */}
        <div className="mx-3 mb-3 p-3 border border-blue-200 bg-blue-50/50 rounded shadow-sm">
          <div className="text-[9px] text-blue-750 uppercase tracking-wider mb-2 border-b border-blue-200 pb-1 flex justify-between">
            <span>STATUS_PROCESSADOR:</span>
            <span className={resultado !== null ? "text-emerald-700 font-bold" : "text-blue-800"}>
              {resultado !== null ? "CONCLUIDO" : "OCIOSO"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-850 text-xs font-bold">[ RESULTADO ]</span>
            <span className="text-zinc-950 font-bold text-2xl tracking-tight">
              {resultado !== null ? resultado : "---"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-200 bg-emerald-50/60">
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
      className="px-3 py-1 border border-emerald-650 text-emerald-650 text-xs hover:bg-emerald-650 hover:text-white transition-all font-mono animate-pulse cursor-pointer rounded"
    >
      [ + ] CALC_SOMA
    </button>
  );
}
