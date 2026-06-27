import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Tela = 'inicio' | 'fases' | 'resultados';

interface JogoState {
  nome: string;
  pontuacao: number;
  telaAtiva: Tela;
  faseAtual: number;
  tempoTotal: number;
  respostas: number[];
  sistemaBloqueado: boolean;
  sessaoId: string; // ID único da tentativa atual

  // Ações
  setNome: (nome: string) => void;
  setTela: (tela: Tela) => void;
  desbloquearSistema: () => void;
  bloquearSistema: () => void;
  registrarFase: (pontos: number, tempoFase: number, resultado: number) => void;
  resetarJogo: () => void;
}

export const useJogoStore = create<JogoState>()(
  persist(
    (set) => ({
      nome: '',
      pontuacao: 0,
      telaAtiva: 'inicio',
      faseAtual: 1,
      tempoTotal: 0,
      respostas: [],
      sistemaBloqueado: true,
      sessaoId: '', // Inicia vazio

      setNome: (nome) => set({
        nome: nome.trim().toUpperCase(),
        // Gera um ID único baseado no tempo e um número aleatório
        sessaoId: `AGENTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }),

      setTela: (tela) => set({ telaAtiva: tela }),

      desbloquearSistema: () => set({ sistemaBloqueado: false }),
      bloquearSistema: () => set({ sistemaBloqueado: true }),

      registrarFase: (pontos, tempoFase, resultado) =>
        set((state) => ({
          pontuacao: state.pontuacao + pontos,
          tempoTotal: state.tempoTotal + tempoFase,
          respostas: [...state.respostas, resultado],
          faseAtual: state.faseAtual + 1
        })),

      resetarJogo: () =>
        set({
          nome: '',
          pontuacao: 0,
          telaAtiva: 'inicio',
          faseAtual: 1,
          tempoTotal: 0,
          respostas: [],
          sistemaBloqueado: false,
          sessaoId: '' // Limpa o ID para a próxima rodada
        }),
    }),
    {
      name: 'terminal-binario-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { sistemaBloqueado, ...rest } = state;
        return rest;
      },
    }
  )
);
