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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-hidden flex flex-col font-mono">
        {/* Header do Modal */}
        <div className="p-3 border-b-2 border-green-950 bg-green-950/20 flex justify-between items-center">
          <span className="text-green-400 font-bold text-xs uppercase tracking-widest">
            [ TERMINAL: CALC_SOMA ]
          </span>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-white font-black cursor-pointer"
          >
            X
          </button>
        </div>

        {/* Form / Inputs */}
        <form onSubmit={handleSomar} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-green-600 uppercase tracking-widest font-bold">
              [ ENTRADA_VALOR_A ]
            </label>
            <input
              type="number"
              step="any"
              value={valorA}
              onChange={(e) => setValorA(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black border border-green-900/50 focus:border-green-500 p-2 text-green-400 text-center text-lg focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-green-600 uppercase tracking-widest font-bold">
              [ ENTRADA_VALOR_B ]
            </label>
            <input
              type="number"
              step="any"
              value={valorB}
              onChange={(e) => setValorB(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black border border-green-900/50 focus:border-green-500 p-2 text-green-400 text-center text-lg focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={handleClear}
              className="py-2 border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 text-xs font-bold uppercase transition-all duration-200 cursor-pointer"
            >
              [ LIMPAR ]
            </button>
            <button
              type="submit"
              className="py-2 bg-green-950/20 hover:bg-green-500 hover:text-black border border-green-500 text-green-500 text-xs font-bold uppercase transition-all duration-200 cursor-pointer"
            >
              [ SOMAR ]
            </button>
          </div>
        </form>

        {/* Display Panel */}
        <div className="mx-4 mb-4 p-3 border border-blue-900/40 bg-blue-950/10 rounded-sm">
          <div className="text-[9px] text-blue-500 uppercase tracking-wider mb-2 border-b border-blue-900/20 pb-1 flex justify-between">
            <span>STATUS_PROCESSADOR:</span>
            <span className={resultado !== null ? "text-green-400 font-bold" : "text-blue-700"}>
              {resultado !== null ? "CONCLUIDO" : "OCIOSO"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-600 text-xs font-bold">[ RESULTADO ]</span>
            <span className="text-white font-bold text-2xl tracking-tight">
              {resultado !== null ? resultado : "---"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-green-950 bg-black">
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
      className="px-3 py-1 border border-green-500 text-green-500 text-xs hover:bg-green-500 hover:text-white transition-all font-mono animate-pulse cursor-pointer"
    >
      [ + ] CALC_SOMA
    </button>
  );
}
