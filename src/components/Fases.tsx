"use client";

import { useJogoStore } from "../store/useGameStore";
import { useCallback, useState, useEffect } from "react";
import { TerminalHeader } from "./UI";
import PuzzleDecimal from "./PuzzleDecimal";
import PuzzlePotencias from "./PuzzlePotencias";
import PuzzleASCII from "./PuzzleASCII";
import PuzzleReverseASCII from "./PuzzleReverseASCII";
import PuzzlePalavra from "./PuzzlePalavra";
import ASCIITable, { ButtonASCIITableModal } from "./ASCIITable";

interface Questao {
  id: number;
  nivel: number;
  tipo: string;
  enunciado: string;
  respostaCorreta: string;
  ativo: boolean;
  origem: string;
}

export default function Fases() {
  const [modalAberto, setModalAberto] = useState(false);
  const [questaoAtual, setQuestaoAtual] = useState<Questao | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [tempoLimiteTotal, setTempoLimiteTotal] = useState<number>(0);
  const [tempoRestante, setTempoRestante] = useState<number | null>(null);
  
  const { nome: nomeAluno, faseAtual, registrarFase, setTela } = useJogoStore();
  const [finalizando, setFinalizando] = useState(false);

  const finalizarAluno = useCallback(async () => {
    if (finalizando) return;
    setFinalizando(true);

    try {
      const alunoData = JSON.parse(localStorage.getItem('bitventure_aluno') || '{}');
      if (!alunoData?.id) return;

      const res = await fetch('/api/aluno/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId: Number(alunoData.id) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erro ao finalizar aluno:', errorData.error || res.statusText);
        return;
      }

      const data = await res.json();
      localStorage.setItem('bitventure_aluno', JSON.stringify({ ...alunoData, tempoConclusaoMs: data.tempoConclusaoMs }));
    } catch (err) {
      console.error('Erro ao finalizar aluno', err);
    }
  }, [finalizando]);

  const buscarQuestao = useCallback(async () => {
    setLoading(true);
    try {
      const alunoData = JSON.parse(localStorage.getItem('bitventure_aluno') || '{}');
      if (!alunoData?.id) {
        console.error('Aluno não encontrado no localStorage.');
        return;
      }

      const res = await fetch(`/api/questoes/proxima?alunoId=${alunoData.id}`);
      const data = await res.json();
      
      if (data.partidaEncerrada || data.concluido) {
        await finalizarAluno();
        setTela('resultados');
      } else {
        setQuestaoAtual(data.questao);
        setTempoLimiteTotal(data.tempoLimiteSegundos || 30);
      }
    } catch (err) {
      console.error('Erro ao buscar questão', err);
    } finally {
      setLoading(false);
    }
  }, [setTela, finalizarAluno]);

  useEffect(() => {
    buscarQuestao();
  }, [buscarQuestao]);

  useEffect(() => {
    if (questaoAtual) {
      setStartTime(Date.now());
    }
  }, [questaoAtual]);

  const registrarSemResposta = useCallback(async (resultado: number) => {
    if (!questaoAtual) return;

    const alunoData = JSON.parse(localStorage.getItem('bitventure_aluno') || '{}');
    const respostaTexto = resultado === 0 ? "PULADA" : "TEMPO_ESGOTADO";

    try {
      await fetch('/api/questoes/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: alunoData.id,
          questaoId: questaoAtual.id,
          resposta: respostaTexto,
          resultado: 0,
          pontosGanhos: 0
        })
      });
    } catch (err) {
      console.error('Erro ao registrar resposta vazia', err);
    }

    const tempoGasto = Date.now() - startTime;
    registrarFase(0, tempoGasto, 0); // 0 pontos, tempoGasto, status 0
    buscarQuestao();
  }, [questaoAtual, startTime, registrarFase, buscarQuestao]);

  // Efeito do timer regressivo
  useEffect(() => {
    if (!questaoAtual || tempoLimiteTotal <= 0) {
      setTempoRestante(null);
      return;
    }

    setTempoRestante(tempoLimiteTotal);

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questaoAtual, tempoLimiteTotal]);

  // Efeito de escuta quando o tempo zera
  useEffect(() => {
    if (tempoRestante === 0) {
      registrarSemResposta(0);
    }
  }, [tempoRestante, registrarSemResposta]);

  const handleAcerto = useCallback(
    async (basePontos: number = 50, tempoMs: number, erros: number, respostaAluno: string) => {
      if (!questaoAtual) return;
      const alunoData = JSON.parse(localStorage.getItem('bitventure_aluno') || '{}');
      const resultado = erros >= 3 ? -1 : 1;

      const pontosGanhosParaPersistir = resultado === 1 ? basePontos : 0;

      const response = await fetch('/api/questoes/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: alunoData.id,
          questaoId: questaoAtual.id,
          resposta: respostaAluno,
          resultado,
          pontosGanhos: pontosGanhosParaPersistir
        })
      });

      const data = await response.json();
      const pontosGanhos = typeof data?.pontosGanhos === 'number' ? data.pontosGanhos : pontosGanhosParaPersistir;
      const resultadoFinal = typeof data?.resultado === 'number' ? data.resultado : resultado;

      // Registra na Store com o mesmo valor persistido no backend
      registrarFase(pontosGanhos, tempoMs, resultadoFinal);
      
      // Busca a próxima
      buscarQuestao();
    },
    [registrarFase, questaoAtual, buscarQuestao],
  );

  const renderPuzzle = () => {
    if (!questaoAtual) return null;

    const props = {
      onAcerto: (pts: number, tempo: number, err: number, resposta: string) => handleAcerto(pts, tempo, err, resposta),
      pontos: 100 // Ou baseado na dificuldade vinda do backend
    };

    switch (questaoAtual.tipo) {
      case 'BINARIO_DECIMAL':
        return <PuzzleDecimal 
            numeroObjetivo={parseInt(questaoAtual.respostaCorreta)} 
            questaoTipo={questaoAtual.tipo}
            questaoEnunciado={questaoAtual.enunciado}
            {...props} />;
      case 'DECIMAL_BINARIO':
        return <PuzzlePotencias 
            numeroObjetivo={parseInt(questaoAtual.enunciado)} 
            {...props} />;
      case 'BINARIO_ASCII':
        return <PuzzleASCII 
            letraObjetivo={questaoAtual.respostaCorreta} 
            {...props} />;
      case 'ASCII_BINARIO':
        return <PuzzleReverseASCII 
            letraObjetivo={questaoAtual.enunciado} 
            {...props}
            onAcerto={(pts: number, tempo: number, err: number, resposta: string) => {
              // Converte o caractere retornado pelo componente para a representação binária esperada pelo backend
              let respostaFinal = resposta;
              if (resposta && resposta !== '?') {
                const charCode = resposta.charCodeAt(0);
                respostaFinal = charCode.toString(2).padStart(8, '0');
              }
              handleAcerto(pts, tempo, err, respostaFinal);
            }} />;
      case 'BINARIO_PALAVRA':
      case 'DECIMAL_PALAVRA':
        return <PuzzlePalavra 
            enunciado={questaoAtual.enunciado}
            respostaCorreta={questaoAtual.respostaCorreta}
            tipo={questaoAtual.tipo as 'BINARIO_PALAVRA' | 'DECIMAL_PALAVRA'}
            {...props} />;
      default:
        return (
          <div className="p-6 border-2 border-red-900 bg-red-900/20 text-red-500 rounded-lg">
            [ERRO] Tipo de questão não suportado: {questaoAtual.tipo}
          </div>
        );
    }
  };

  if (loading) return <div className="text-green-500 font-mono">Sincronizando...</div>;

  return (
    <div className="py-1 font-mono">
      <TerminalHeader
        items={[
          { label: "OPERADOR", value: nomeAluno || "ANÔNIMO" },
          { label: "FASE", value: `${faseAtual}` },
          { label: "TEMPO RESTANTE", value: tempoRestante !== null ? `${tempoRestante}s` : "ILIMITADO" },
        ]}
      />

      {tempoRestante !== null && (
        <div className="w-full bg-zinc-950 border border-green-900/30 p-2 mb-4 flex justify-between items-center text-xs font-mono">
          <span className="text-green-800 text-[10px]">SISTEMA_DURABILIDADE_DE_LINK:</span>
          <div className="flex-1 mx-4 bg-zinc-900 h-2 border border-green-950 rounded-sm overflow-hidden relative">
            <div
              className={`h-full transition-all duration-1000 ${tempoRestante <= 5 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}
              style={{ width: `${(tempoRestante / tempoLimiteTotal) * 100}%` }}
            />
          </div>
          <span className={`font-bold ${tempoRestante <= 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
            {tempoRestante}s
          </span>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
        {renderPuzzle()}
      </div>

      <div className="mt-4 flex justify-between items-center bg-zinc-950/40 p-3 border border-green-900/20 rounded">
        <button
          onClick={() => registrarSemResposta(0)}
          type="button"
          className="group relative overflow-hidden border border-amber-600/50 px-6 py-1.5 font-bold text-amber-500 hover:text-black hover:bg-amber-500 transition-all duration-300 text-xs uppercase cursor-pointer"
        >
          [ PULAR_QUESTÃO ]
        </button>
        <p className="text-[9px] text-green-700 uppercase tracking-wider hidden sm:block">
          o pulo registrará 0 pontos e avançará à próxima fase
        </p>
      </div>

      <div className="fixed bottom-4 right-4">
        <ButtonASCIITableModal onClick={() => setModalAberto(true)} />
      </div>
      <ASCIITable isOpen={modalAberto} onClose={() => setModalAberto(false)} />
    </div>
  );
}
