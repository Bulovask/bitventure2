import React from 'react';

// 1. Logs de Sistema (o texto verde escuro no topo)
export const TerminalLogs = ({ logs }: { logs: string[] }) => (
  <div className="w-full space-y-1 text-xs md:text-sm text-green-800 uppercase select-none opacity-70">
    {logs.map((log, i) => (
      <p key={i}>[ OK ] {log}</p>
    ))}
  </div>
);

// 2. Título de Tela (H1 estilizado)
export const TerminalTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="w-full space-y-2">
    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-green-500 uppercase">
      {title}_
    </h1>
    {subtitle && <p className="text-green-700 text-xs md:text-sm uppercase">{subtitle}</p>}
  </div>
);

// 3. Botão Principal (O famoso botão com preenchimento)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const TerminalButton = ({ label, className, ...props }: ButtonProps) => (
  <button
    {...props}
    className={`group relative overflow-hidden border border-green-500 px-10 py-2 font-bold text-green-500 hover:text-green-950 transition-colors duration-300 ${className}`}
  >
    <div className="absolute inset-0 bg-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
    <span className="relative z-10 uppercase">[ {label} ]</span>
  </button>
);


// 4. Badge de Status (Piscante)
export const StatusBadge = ({ success, label }: { success: boolean; label: string }) => (
  <div className="flex items-start gap-3">
    <div className={`w-2 h-2 mt-1.5 rounded-full animate-pulse ${success ? 'bg-green-500' : 'bg-red-500'}`} />
    <p className={`text-sm font-bold uppercase ${success ? 'text-green-500' : 'text-red-500'}`}>
      {label}
    </p>
  </div>
);

// 5. Container de Informação (Usado para Operador e Score)
export const InfoBlock = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className={`min-w-0 ${highlight ? 'w-fit bg-green-900/10 p-2 border border-green-900/30 rounded-sm' : 'border-l-2 border-green-500 pl-4'}`}>
    <span className="text-[10px] text-green-800 uppercase font-bold tracking-widest block mb-1">
      {label}
    </span>
    <p className={`font-bold truncate ${highlight ? 'text-2xl text-green-400 whitespace-nowrap' : 'text-xl md:text-2xl text-white'}`}>
      {value}
    </p>
  </div>
);

// 6. Header de Status Superior
export const TerminalHeader = ({ items }: { items: { label: string; value: string | number }[] }) => (
  <header className="flex justify-between border-b border-green-500/30 pb-1 mb-1 text-[10px] md:text-xs tracking-widest uppercase">
    {items.map((item, i) => (
      <div key={i} className="flex gap-2">
        <span className="text-green-800">{item.label}:</span>
        <span className="text-green-400">{item.value}</span>
      </div>
    ))}
  </header>
);
