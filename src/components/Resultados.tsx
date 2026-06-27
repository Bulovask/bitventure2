"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useJogoStore } from "../store/useGameStore";
import {
  TerminalLogs,
  TerminalTitle,
  TerminalButton,
  StatusBadge,
  InfoBlock,
} from "./UI";

export default function Resultados() {
  const router = useRouter();
  const {
    nome,
    pontuacao: pontos,
    tempoTotal,
    respostas,
    resetarJogo,
  } = useJogoStore();

  // Referência para garantir que o envio ocorra apenas uma vez por sessão
  const jaEnviado = useRef(false);

  // Lógica de Aprovação (XP mínima para passar de nível no PIBID)
  const aprovado = pontos >= 150;
  const acertosTotais = respostas.filter((r) => r === 1).length;
  const precisao =
    respostas.length > 0
      ? ((acertosTotais / respostas.length) * 100).toFixed(0)
      : "0";

  // Formatação de Tempo (ms -> mm:ss)
  const tempoFormatado = useMemo(() => {
    const totalSegundos = Math.floor(tempoTotal / 1000);
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;
  }, [tempoTotal]);

  useEffect(() => {
    const enviarParaPlanilha = async () => {
      // Sua URL do Google Apps Script já configurada
      const URL_APPS_SCRIPT =
        "https://script.google.com/macros/s/AKfycbxG_r7W8lWaHPgW5sy5WLSPzbR_23AZ3W6-oyfNZXZBKd9ItIY1x5iLgZqS8Z7_bepu/exec";

      // Bloqueios de segurança: já enviado, sem nome ou URL padrão
      if (jaEnviado.current || !nome || URL_APPS_SCRIPT.includes("SUA_URL"))
        return;

      jaEnviado.current = true;

      try {
        await fetch(URL_APPS_SCRIPT, {
          method: "POST",
          mode: "no-cors", // Necessário para evitar erros de CORS com o Google Apps Script
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operador: nome,
            score: pontos,
            tempo_total: tempoFormatado,
            precisao: `${precisao}%`,
            mapa_respostas: respostas.join(","),
            data_hora: new Date().toLocaleString("pt-BR"),
            sessao_id: useJogoStore.getState().sessaoId, // Envia o ID único
          }),
        });
        console.log("Dados sincronizados com o Servidor Central.");
      } catch (error) {
        console.error("Erro na sincronização de dados:", error);
        // Em caso de erro real de rede, permitimos nova tentativa se o componente remontar
        jaEnviado.current = false;
      }
    };

    enviarParaPlanilha();
  }, [nome, pontos, tempoFormatado, precisao, respostas]);

  const handleReiniciar = () => {
    // Limpa dados de login do aluno
    localStorage.removeItem('bitventure_aluno');
    // Reseta estado do Zustand
    resetarJogo();
    // Redireciona para tela de login de aluno
    router.push('/aluno/entrar');
  };

  return (
    <div className="flex flex-col items-start gap-4 py-2 px-4 md:px-8 font-mono animate-in fade-in duration-1000 w-full max-w-4xl mx-auto">
      <TerminalLogs
        logs={["DATA_TRANSFER_COMPLETE", "GENERATING_FINAL_REPORT..."]}
      />

      <TerminalTitle title="RELATÓRIO_DE_MISSÃO" />

      {/* Painel de Resultados */}
      <div className="w-full bg-zinc-950 border border-green-900 p-3 space-y-3 relative overflow-hidden">
        <div className="absolute -top-5 -right-5 text-green-900/10 text-9xl font-black rotate-12 pointer-events-none">
          {aprovado ? "PASS" : "FAIL"}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <InfoBlock label="ID_OPERADOR" value={nome || "UNKNOWN"} />
          <InfoBlock
            label="SCORE_TOTAL"
            value={`${pontos.toString().padStart(4, "0")} XP`}
            highlight
          />
          <InfoBlock label="TEMPO_DE_INVASÃO" value={tempoFormatado} />
        </div>

        <div className="pt-2 border-t border-green-900/20 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <p className="text-[10px] text-green-700 mb-2 uppercase tracking-widest">
              Integridade_dos_Dados
            </p>
            <div className="w-full h-3 bg-zinc-900 border border-green-900/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${aprovado ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500"}`}
                style={{ width: `${precisao}%` }}
              />
            </div>
            <p className="text-[10px] text-right mt-1 text-green-600">
              {precisao}% Precisão
            </p>
          </div>

          <div className="bg-green-950/20 p-3 border border-green-900/30 rounded">
            <p className="text-[10px] text-green-800 uppercase">Resumo_Fases</p>
            <div className="flex gap-1 mt-1 font-mono">
              {respostas.map((r, i) => {
                let colorClass = "bg-zinc-700 border-zinc-500";
                let statusLabel = "PULO/TEMPO";
                if (r === 1) {
                  colorClass = "bg-green-500 border-green-400";
                  statusLabel = "CORRETO";
                } else if (r === -1) {
                  colorClass = "bg-red-900 border-red-700";
                  statusLabel = "ERRO";
                }
                return (
                  <div
                    key={i}
                    title={`Fase ${i + 1}: ${statusLabel}`}
                    className={`w-3 h-3 border ${colorClass}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <StatusBadge
            success={aprovado}
            label={
              aprovado ? "STATUS: AGENTE_NIVEL_1" : "STATUS: ACESSO_NEGADO"
            }
          />
          <p className="text-xs text-green-800/80 italic ml-1">
            {aprovado
              ? "> Protocolo BitVenture concluído. Dados pedagógicos arquivados."
              : "> Falha na paridade de bits. Recomendado treinamento em lógica binária."}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 w-full pt-4">
        <div className="flex gap-4">
          <TerminalButton
            label="REINICIAR_SISTEMA"
            onClick={handleReiniciar}
            className="text-xs py-2 px-8"
          />
        </div>
        <p className="text-[8px] text-green-900 tracking-tighter uppercase animate-pulse">
          Sincronização ativa com servidor via Apps Script Protocol
        </p>
      </div>
    </div>
  );
}
