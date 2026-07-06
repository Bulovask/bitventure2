# Documento de Arquitetura de Software (SAD)

# Projeto: Bitventure 2

**Versão:** 1.1  
**Tipo:** Aplicação Web Offline-First para Rede Local (LAN)  
**Stack Principal:** Next.js + SQLite + Prisma  
**Objetivo:** Definir a arquitetura técnica necessária para implementação do sistema Bitventure 2.

---

# 1. Visão Geral da Arquitetura

O Bitventure 2 será uma aplicação Web executada integralmente dentro de uma rede local (LAN), sem dependência de internet.

A máquina do professor atuará simultaneamente como:

- Servidor da aplicação Next.js
- Servidor de banco de dados SQLite (via Prisma)
- Host do painel administrativo
- Host do ranking projetado

Todos os dispositivos dos alunos acessarão o sistema através do navegador utilizando a rede Wi-Fi local disponibilizada pelo roteador.

---

# 2. Arquitetura de Rede (LAN)

## Topologia

```text
                   ┌───────────────────┐
                   │     Projetor      │
                   │ Ranking Público   │
                   └────────┬──────────┘
                            │
                            │
                     Rede Wi-Fi Local
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        │                   │                   │
 ┌──────▼─────┐      ┌──────▼─────┐      ┌──────▼─────┐
 │ Aluno 01   │      │ Aluno 02   │      │ Aluno 40   │
 │ Navegador  │      │ Navegador  │      │ Navegador  │
 └──────┬─────┘      └──────┬─────┘      └──────┬─────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Professor      │
                    │ Next.js Server │
                    │ SQLite/Prisma  │
                    └────────────────┘
```

---

## Descoberta do Servidor

Ao iniciar a aplicação, o sistema deverá detectar automaticamente o IP local da máquina do professor.
A aplicação ficará acessível via IP e porta (ex: `http://192.168.1.50:3000`).

---

## Simplificação de Acesso

### Estratégia Recomendada

Na tela inicial do professor será exibido o endereço da aplicação e um QRCode para acesso rápido, eliminando a necessidade de digitação pelos alunos.

---

# 3. Arquitetura da Aplicação

## Modelo Arquitetural

Arquitetura Monolítica Modular.

```text
Next.js
├── Frontend
├── Backend (Route Handlers / Server Actions)
├── API
├── Eventos em Tempo Real (SSE)
└── Persistência (Prisma + SQLite)
```

---

# 4. Stack Tecnológica

## Front-end

- **Framework:** Next.js 15+ / React 19 / TypeScript
- **UI:** Tailwind CSS / shadcn/ui
- **Estado Cliente:** TanStack Query / Zustand

---

## Back-end / Persistência

### ORM: Prisma

O **Prisma ORM** é a camada oficial de acesso ao banco de dados SQLite.

**Justificativa:**
- Tipagem forte ponta-a-ponta.
- Facilidade em migrações de esquema.
- Produtividade no desenvolvimento.

**Observação de Performance:**
Para operações que exijam alta performance ou consultas complexas de agregação no ranking, poderá ser utilizado o `prisma.$queryRaw`.

### Banco de Dados: SQLite

Arquivo local: `/data/bitventure.db`

---

# 5. Estratégia de Tempo Real

## Server-Sent Events (SSE)

**Justificativa:** O sistema necessita apenas de comunicação unidirecional (servidor → cliente) para atualizações de ranking e sinalização de parada da partida. SSE é mais simples de implementar e consome menos recursos que WebSockets no contexto de uma LAN com 40-50 dispositivos.

---

# 6. Estratégia do Botão de Parar

## Fonte da Verdade

O servidor é a autoridade única. O tempo restante é calculado com base em um timestamp de milissegundos enviado pelo servidor.

**Fluxo:**
1. Professor clica em "Parar".
2. Servidor calcula `stopAtMs` (atual + 120.000ms).
3. Evento SSE envia o timestamp `stopAtMs`.
4. Clientes calculam o tempo restante localmente: `stopAtMs - Date.now()`.

---

# 7. Modelo Conceitual do Banco

## Entidades Principais

- **Aluno:** Participantes, pontuação e tempos.
- **Questão:** Banco mestre (incluindo as geradas proceduralmente).
- **Sorteio:** Registro de RN01 (Antifila) e auditoria.
- **Resposta:** Histórico para exportação e correção.
- **Configuração:** Parâmetros da partida e estado global.

---

# 8. Precisão Temporal e Desempate (RN02)

Todos os registros temporais de duração ou conclusão **devem** utilizar **Milissegundos (ms)**.

**Ordenação do Ranking:**
```sql
ORDER BY pontuacao DESC, tempoConclusaoMs ASC
```

---

# 9. Decisões Arquiteturais Finais

| Item | Decisão |
|--------|----------|
| Front-end | Next.js + React |
| Persistência | **Prisma ORM** + SQLite |
| Tempo Real | Server-Sent Events (SSE) |
| Precisão Temporal | Milissegundos (ms) |
| Descoberta | IP Local + QRCode |
| Fonte da Verdade | Servidor |
| Performance | `prisma.$queryRaw` se necessário |

---

# 10. Recomendações de Implementação

1. **Escrita Concorrente:** Habilitar `PRAGMA journal_mode = WAL;` no SQLite via Prisma para suportar múltiplas submissões simultâneas.
2. **RN04 (Geração Procedural):** Integrar a lógica de geração automática diretamente no serviço de sorteio, marcando a origem da questão como `GERADA_AUTOMATICAMENTE`.
