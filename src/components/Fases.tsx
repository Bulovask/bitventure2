"use client";

import { useJogoStore } from "../store/useGameStore";
import { useCallback, useState, useEffect } from "react";
import { TerminalHeader } from "./UI";
import PuzzleDecimal from "./PuzzleDecimal";
import PuzzlePotencias from "./PuzzlePotencias";
import PuzzleASCII from "./PuzzleASCII";
import PuzzleReverseASCII from "./PuzzleReverseASCII";
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
  
  const { nome: nomeAluno, faseAtual, registrarFase, setTela } = useJogoStore();

  const buscarQuestao = useCallback(async () => {
    setLoading(true);
    try {
      const alunoData = JSON.parse(localStorage.getItem('bitventure_aluno') || '{}');
      const res = await fetch(`/api/questoes/proxima?alunoId=${alunoData.id}`);
      const data = await res.json();
      
      if (data.concluido) {
        setTela("resultados");
      } else {
        setQuestaoAtual(data.questao);
      }
    } catch (err) {
      console.error('Erro ao buscar questão', err);
    } finally {
      setLoading(false);
    }
  }, [setTela]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    buscarQuestao();
  }, [buscarQuestao]);

  const handleAcerto = useCallback(
    async (basePontos: number = 50, tempoMs: number, erros: number, respostaAluno: string) => {
      // 1. Envia resposta para o backend
      const alunoData = JSON.parse(localStorage.getItem('bitventure_aluno') || '{}');
      await fetch('/api/questoes/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: alunoData.id,
          questaoId: questaoAtual.id,
          resposta: respostaAluno 
        })
      });

      // Cálculo de Bônus de Velocidade
      const bonusVelocidade = Math.max(0, 20 - Math.floor(tempoMs / 1000));
      const penalidade = erros * 5;
      const pontuacaoFinal = Math.max(10, basePontos + bonusVelocidade - penalidade);

      // Registra na Store
      registrarFase(pontuacaoFinal, tempoMs, erros > 2);
      
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
        ]}
      />

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
        {renderPuzzle()}
      </div>

      <div className="fixed bottom-4 right-4">
        <ButtonASCIITableModal onClick={() => setModalAberto(true)} />
      </div>
      <ASCIITable isOpen={modalAberto} onClose={() => setModalAberto(false)} />
    </div>
  );
}
