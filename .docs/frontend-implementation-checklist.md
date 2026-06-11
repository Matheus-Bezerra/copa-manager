# Frontend Implementation Checklist

Checklist de implementação do frontend por step. Referências (ordem de prioridade do [AGENTS.md](../AGENTS.md)):

1. [requirements.md](./requirements.md)
2. [domain-model.md](./domain-model.md)
3. [api-spec.md](./api-spec.md)
4. [architecture-frontend.md](./architecture-frontend.md)

---

## Legenda

| Símbolo | Significado |
| --- | --- |
| `[ ]` | Pendente |
| `[x]` | Concluído |
| `—` | Já existia antes deste checklist |

---

## Visão geral

O frontend tem duas áreas:

| Área | Rota base | Auth | Propósito |
| --- | --- | --- | --- |
| **Painel admin** | `/` (layout pathless `/_app`) | JWT Bearer | Organizadores gerenciam campeonatos |
| **Portal público** | `/c/$slug` | Não | Espectadores acompanham o torneio |

Todas as features admin (exceto auth e perfil) são escopadas por campeonato (`$championshipId` na URL).

---

## Definition of Done (por step)

- [ ] Tipos em `src/http/types/<domínio>/`
- [ ] Função pura + hook em `src/http/hooks/<domínio>/`
- [ ] Re-export em `src/http/index.ts`
- [ ] Rotas em `src/pages/` + componentes em `-components/`
- [ ] Formulários: React Hook Form + Zod + `FormErrorMessage` + `ButtonLoading`
- [ ] Erros: `errorHandler` + `toast` (nunca `alert`)
- [ ] Loader com `ensureQueryData` quando a tela depende de dados críticos
- [ ] Testável manualmente contra backend local

---

## Decisões fechadas

| Decisão | Escolha |
| --- | --- |
| Tela inicial pós-login | Dashboard em `/` listando campeonatos |
| Contexto de campeonato | Layout aninhado `/championships/$championshipId/layout.tsx` |
| URL do portal público | `/c/$slug` |
| Padrão HTTP | Manual — pacote: `mutationKey/queryKey` → função pura → hook |
| Partida ao vivo | Invalidate query após cada mutation (sem polling, sem WebSocket) |
| Tema | Dark green fixo — variáveis em `globals.css` |

---

## Padrão de hook (usar em todos os steps)

Referência: `frontend/src/http/hooks/auth/use-login.ts`

**Mutation:**

```ts
// src/http/hooks/championships/use-create-championship.ts
export const createChampionshipMutationKey = () => [{ url: '/championships' }] as const

export async function createChampionship(data: CreateChampionshipBody) {
  const res = await client<CreateChampionshipResponse, CreateChampionshipBody>({
    method: 'POST',
    url: '/championships',
    data,
  })
  return res.data
}

export function useCreateChampionship(options?: {
  mutation?: Omit<
    UseMutationOptions<CreateChampionshipResponse, ResponseErrorConfig<ApiErrorPayload>, { data: CreateChampionshipBody }>,
    'mutationKey' | 'mutationFn'
  >
}) {
  return useMutation({
    mutationKey: createChampionshipMutationKey(),
    mutationFn: ({ data }) => createChampionship(data),
    ...options?.mutation,
  })
}
```

**Query:**

```ts
// src/http/hooks/championships/use-fetch-championships.ts
export const fetchChampionshipsQueryKey = () => [{ url: '/championships' }] as const

export async function fetchChampionships() {
  const res = await client<FetchChampionshipsResponse>({ method: 'GET', url: '/championships' })
  return res.data
}

export function useFetchChampionships(options?: {
  query?: Partial<QueryObserverOptions<FetchChampionshipsResponse, ResponseErrorConfig<ApiErrorPayload>>>
}) {
  return useQuery({
    queryKey: fetchChampionshipsQueryKey(),
    queryFn: fetchChampionships,
    ...options?.query,
  })
}
```

---

## Baseline — já implementado

| Domínio | Artefatos | Status |
| --- | --- | --- |
| Bootstrap | Vite, Router, Query, nuqs, Zustand, Tailwind 4 | — |
| Auth | login, register, logout, refresh, forgot/reset password | — |
| Perfil | `GET /me` + prefetch no layout `/_app` | — |
| HTTP client | Axios + JWT + refresh automático | — |
| Layout `/_app` | Sidebar, guard de auth, logout | — |
| Dashboard | Lista de campeonatos | — |
| shadcn | button, input, label, sonner, tooltip | — |

---

## Ordem de execução

```text
S00  Identidade visual (dark green)
  → S01  Shell + componentes base
    → S02  Dashboard (lista campeonatos)
      → S03  Criar campeonato
        → S04  Layout do campeonato + overview
          → S05  Editar e excluir campeonato
            → S06  Membros e convites
              → S07  Times
                → S08  Jogadores
                  → S09  Estrutura da competição
                    → S10  Partidas
                      → S11  Partida ao vivo + eventos [inclui backend]
                        → S12  Classificação
                          → S13  Regras
                            → S14  Premiações
                              → S15  Portal público
                                → S16  Redesign telas de auth
```

---

## S00 — Identidade visual (dark green)

**Objetivo:** Aplicar o tema escuro com verde como cor primária antes de construir qualquer tela.

**Arquivo:** `frontend/src/styles/globals.css`

- [x] Substituir variáveis `--background` e `--foreground` de `:root` por equivalentes escuros
- [x] Definir `--primary` como verde vibrante (ex.: `oklch(0.65 0.2 145)`)
- [x] Definir sidebar mais escura que o background (ex.: `oklch(0.13 0.03 145)`)
- [x] Remover ou igualar o bloco `.dark` ao `:root` (tema único escuro)
- [x] Definir gradiente de fundo no `body` via `@layer base`
- [x] Ajustar `--card`, `--muted`, `--border`, `--input` para contraste legível no fundo escuro
- [x] Verificar visualmente login, register e dashboard placeholder

Referência de paleta sugerida:

```css
:root {
  /* fundo: verde muito escuro */
  --background: oklch(0.11 0.025 145);
  /* superfícies (cards, popovers) */
  --card: oklch(0.15 0.025 145);
  /* primário: verde médio vibrante */
  --primary: oklch(0.65 0.2 145);
  --primary-foreground: oklch(0.98 0 0);
  /* sidebar: um tom acima do background */
  --sidebar: oklch(0.14 0.03 145);
  /* textos */
  --foreground: oklch(0.95 0.01 145);
  --muted-foreground: oklch(0.60 0.03 145);
  /* bordas e inputs */
  --border: oklch(0.22 0.03 145);
  --input: oklch(0.20 0.03 145);
}
```

Gradiente no body:

```css
@layer base {
  body {
    @apply bg-background text-foreground;
    background-image: linear-gradient(
      160deg,
      oklch(0.13 0.04 155) 0%,
      oklch(0.10 0.02 140) 100%
    );
    min-height: 100svh;
  }
}
```

---

## S01 — Shell + componentes base

**Objetivo:** Layout profissional reutilizável antes de qualquer feature.

**Depende de:** S00

### Instalar componentes shadcn

```bash
npx shadcn@latest add card badge table dialog alert-dialog form select dropdown-menu skeleton separator sheet
```

> O componente `sidebar` do shadcn pode ser adicionado depois; no MVP use um sidebar manual (mais simples de customizar com o tema verde).

### Componentes a criar

- [x] `src/components/pagination.tsx` — recebe `page`, `totalPages`, `onPageChange`
- [x] `src/components/empty-state.tsx` — recebe `title`, `description`, `action?`
- [x] `src/components/splash-page.tsx` — spinner/skeleton de loading global (usado como `pendingComponent` no layout `/_app`)

### Navegação

- [x] `src/constants/nav.ts` — array tipado com itens do menu admin

```ts
// src/constants/nav.ts
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

export const appNav: NavItem[] = [
  { label: 'Dashboard', to: '/' },
  // Adicionar itens à medida que as rotas forem criadas
]
```

### Layout `/_app`

- [x] Atualizar `src/pages/_app/layout.tsx`:
  - Sidebar com `appNav` + nome do usuário
  - `pendingComponent: SplashPage` na definição da rota
  - `<Outlet />` na área de conteúdo principal
  - Botão logout já existente mantido

> **Convenção de rotas:** o painel admin usa layout pathless `/_app` com dashboard em `/`. Rotas de campeonato ficam em `/championships/...` (sem prefixo `/app`).

---

## S02 — Dashboard (lista campeonatos)

**Objetivo:** Tela inicial útil — usuário vê seus campeonatos e cria novos.

**Depende de:** S01

**Endpoint:** `GET /championships`

**Response:**
```ts
{ data: { championships: Championship[] } }

type Championship = {
  id: string
  ownerUserId: string
  name: string
  slug: string
  description: string | null
  regulations: string | null
  startDate: Date
  endDate: Date
  status: 'OPEN' | 'IN_PROGRESS' | 'FINISHED'
  createdAt: Date
  updatedAt: Date
}
```

### HTTP

- [x] `src/http/types/championships/championship.ts` — tipo `Championship`
- [x] `src/http/types/championships/fetch-championships.ts` — `FetchChampionshipsResponse`
- [x] `src/http/hooks/championships/use-fetch-championships.ts`
- [x] Re-export em `src/http/index.ts`

### Página

- [x] Atualizar `src/pages/_app/index.tsx`:
  - Loader: `queryClient.ensureQueryData(fetchChampionshipsQueryOptions())`
  - Saudação com nome do usuário (via `useAuthStore`)
  - Grid de cards: nome, badge de status, datas, slug
  - Empty state: "Você ainda não tem campeonatos" + botão "Criar campeonato"
  - Loading: `Skeleton` nos cards
  - Erro: `errorHandler` + `toast`
  - Botão "Novo campeonato" → link para `/championships/create`

### Badge de status

Mapear `status` para label PT e variante da badge:

| Status | Label | Variante |
| --- | --- | --- |
| `OPEN` | Aberto | `secondary` |
| `IN_PROGRESS` | Em andamento | `default` (verde) |
| `FINISHED` | Encerrado | `outline` |

---

## S03 — Criar campeonato

**Objetivo:** Formulário de criação de campeonato.

**Depende de:** S02

**Endpoint:** `POST /championships`

**Request:** `{ name, description?, startDate, endDate }`
**Response:** `{ data: { championship: Championship } }`

### HTTP

- [x] `src/http/types/championships/create-championship.ts` — `CreateChampionshipBody`, `CreateChampionshipResponse`
- [x] `src/http/hooks/championships/use-create-championship.ts`
- [x] Re-export em `src/http/index.ts`

### Página

- [x] `src/pages/_app/championships/create/index.tsx`
- [x] `-components/create-championship-form.tsx`:
  - Campos: `name` (obrigatório), `description` (textarea), `startDate`, `endDate`
  - Validação Zod: nome obrigatório, `endDate > startDate`
  - Tratar erro `CHAMPIONSHIP/NAME_ALREADY_EXISTS` como campo error no form
  - `onSuccess` → `invalidate fetchChampionshipsQueryKey()` + `navigate({ to: '/championships/$championshipId' })`

---

## S04 — Layout do campeonato + overview

**Objetivo:** Contexto visual ao entrar em um campeonato; submenu lateral.

**Depende de:** S03

**Endpoint:** `GET /championships/:championshipId`

**Response:** `{ data: { championship: Championship } }`

### HTTP

- [x] `src/http/types/championships/get-championship.ts` — `GetChampionshipResponse`
- [x] `src/http/hooks/championships/use-get-championship.ts` — query com `championshipId` no queryKey
- [x] Re-export em `src/http/index.ts`

### Rotas

- [x] `src/pages/_app/championships/$championshipId/layout.tsx`:
  - `loader`: `ensureQueryData(getChampionshipQueryOptions(championshipId))`
  - Submenu: Overview, Times, Jogadores, Estrutura, Partidas, Classificação, Regras, Membros, Premiações, Configurações
  - Nome do campeonato no topo (do loader)
  - `pendingComponent: SplashPage`

- [x] `src/pages/_app/championships/$championshipId/index.tsx` — overview:
  - Cards de resumo: status, datas, descrição
  - Link "Ver página pública" → `/c/$slug` (tab target `_blank`)
  - Atalhos para as seções (Times, Partidas, Classificação)

### Nav

- [x] Atualizar `src/constants/nav.ts` com item "Meus Campeonatos" → `/`
- [x] `src/constants/championship-nav.ts` — submenu do campeonato

---

## S05 — Editar e excluir campeonato

**Objetivo:** Owner edita dados e pode excluir o campeonato.

**Depende de:** S04

**Endpoints:**
- `PUT /championships/:championshipId`
- `DELETE /championships/:championshipId`

**Request PUT:** `{ name?, description?, startDate?, endDate? }`

### HTTP

- [x] `src/http/types/championships/update-championship.ts` — `UpdateChampionshipBody`, `UpdateChampionshipResponse`
- [x] `src/http/types/championships/delete-championship.ts` — `DeleteChampionshipResponse`
- [x] `src/http/hooks/championships/use-update-championship.ts`
- [x] `src/http/hooks/championships/use-delete-championship.ts`
- [x] Re-export em `src/http/index.ts`

### Página

- [x] `src/pages/_app/championships/$championshipId/settings/index.tsx` + `-components/update-championship-form.tsx`:
  - Form pré-preenchido com dados atuais (do loader pai)
  - `onSuccess` PUT → `invalidate getChampionshipQueryKey(id)` + toast
  - Seção "Zona de perigo" — botão excluir (visível só para Owner)
  - `AlertDialog` de confirmação antes de deletar
  - `onSuccess` DELETE → `invalidate fetchChampionshipsQueryKey()` + `navigate({ to: '/' })`

---

## S06 — Membros e convites

**Objetivo:** Gestão de membros do campeonato; convites por e-mail.

**Depende de:** S04

**Endpoints:**
- `GET /championships/:championshipId/members`
- `POST /championships/:championshipId/members/invite` — `{ email, role: 'ADMINISTRATOR' | 'ORGANIZER' }`
- `PATCH /championships/:championshipId/members/:memberId` — `{ role }`
- `DELETE /championships/:championshipId/members/:memberId`
- `POST /invitations/accept` — `{ token }`

**Tipos relevantes:**
```ts
type Member = {
  id: string; championshipId: string; userId: string
  role: 'OWNER' | 'ADMINISTRATOR' | 'ORGANIZER'
  user: { id: string; name: string; email: string; avatarUrl: string | null }
  createdAt: Date
}
```

### HTTP

- [x] `src/http/types/members/member.ts` — `Member`, `ChampionshipRole`
- [x] `src/http/types/members/fetch-members.ts`
- [x] `src/http/types/members/invite-member.ts`
- [x] `src/http/types/members/update-member-role.ts`
- [x] `src/http/types/members/remove-member.ts`
- [x] `src/http/types/members/accept-invitation.ts`
- [x] `src/http/hooks/members/use-fetch-members.ts`
- [x] `src/http/hooks/members/use-invite-member.ts`
- [x] `src/http/hooks/members/use-update-member-role.ts`
- [x] `src/http/hooks/members/use-remove-member.ts`
- [x] `src/http/hooks/members/use-accept-invitation.ts`
- [x] Re-export em `src/http/index.ts`

### Páginas

- [x] `src/pages/_app/championships/$championshipId/members/index.tsx` + `-components/championship-members-view.tsx`:
  - Tabela: avatar, nome, e-mail, role, ações
  - Botão "Convidar" → `Dialog` com form (e-mail + select role)
  - Alterar role via select inline (Owner only, exceto para si mesmo)
  - Remover membro com `AlertDialog` (Owner/Admin only, Owner não removível)
  - `invalidate fetchMembersQueryKey(championshipId)` após mutations

- [x] `src/pages/invitations/accept/index.tsx` (fora de `/_app`):
  - Lê `token` da query string
  - Se autenticado: chama `acceptInvitation` automaticamente → redirect `/`
  - Se não autenticado: redirect `/sign-in?redirect=/invitations/accept?token=...`

---

## S07 — Times

**Objetivo:** CRUD de equipes do campeonato.

**Depende de:** S04

**Endpoints:**
- `GET /championships/:championshipId/teams`
- `POST /championships/:championshipId/teams`
- `PUT /championships/:championshipId/teams/:teamId`
- `DELETE /championships/:championshipId/teams/:teamId`

**Campos do time:**
```ts
type Team = {
  id: string; championshipId: string; name: string
  shortName: string | null; logoUrl: string | null
  primaryColor: string | null; secondaryColor: string | null
  createdAt: Date; updatedAt: Date
}

// Body criar/editar
{ name, shortName?, logoUrl?, primaryColor?, secondaryColor? }
```

### HTTP

- [x] `src/http/types/teams/team.ts` — `Team`
- [x] `src/http/types/teams/fetch-teams.ts`
- [x] `src/http/types/teams/create-team.ts`
- [x] `src/http/types/teams/update-team.ts`
- [x] `src/http/types/teams/delete-team.ts`
- [x] `src/http/hooks/teams/use-fetch-teams.ts`
- [x] `src/http/hooks/teams/use-create-team.ts`
- [x] `src/http/hooks/teams/use-update-team.ts`
- [x] `src/http/hooks/teams/use-delete-team.ts`
- [x] Re-export em `src/http/index.ts`

### Páginas

- [x] `src/pages/_app/championships/$championshipId/teams/(teams)/index.tsx`:
  - Listagem em tabela ou grid de cards
  - Botão "Novo time" abre `Dialog` com form
  - Editar abre o mesmo `Dialog` pré-preenchido
  - Confirmar exclusão com `AlertDialog`
  - `invalidate fetchTeamsQueryKey(championshipId)` após mutations

- [x] `-components/team-form.tsx` — campos: nome, sigla, cores (hex), URL do logo

### Validação Zod no form

```ts
const teamSchema = z.object({
  name: z.string().min(1).max(100),
  shortName: z.string().max(3).optional().nullable(),
  logoUrl: z.url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
})
```

---

## S08 — Jogadores

**Objetivo:** CRUD de jogadores vinculados a times do campeonato.

**Depende de:** S07 (times necessários para vincular)

**Endpoints:**
- `GET /championships/:championshipId/players` — lista jogadores do campeonato
- `POST /championships/:championshipId/players`
- `PUT /championships/:championshipId/players/:playerId`
- `DELETE /championships/:championshipId/players/:playerId`

**Campos do jogador:**
```ts
type Player = {
  id: string; teamId: string; name: string
  shirtNumber: number | null
  createdAt: Date; updatedAt: Date
  statistics: PlayerStatistics | null
}

type PlayerStatistics = {
  matchesPlayed: number; goals: number; assists: number
  yellowCards: number; redCards: number; matchMvps: number
}

// Body criar
{ teamId, name, shirtNumber? }
// Body editar (todos opcionais)
{ teamId?, name?, shirtNumber? }
```

### HTTP

- [x] `src/http/types/players/player.ts` — `Player`, `PlayerStatistics`
- [x] `src/http/types/players/fetch-players.ts` — params: `{ championshipId, teamId? }`
- [x] `src/http/types/players/create-player.ts`
- [x] `src/http/types/players/update-player.ts`
- [x] `src/http/types/players/delete-player.ts`
- [x] `src/http/hooks/players/use-fetch-players.ts` — aceita `teamId` opcional no queryKey
- [x] `src/http/hooks/players/use-create-player.ts`
- [x] `src/http/hooks/players/use-update-player.ts`
- [x] `src/http/hooks/players/use-delete-player.ts`
- [x] Re-export em `src/http/index.ts`

### Páginas

- [x] `src/pages/_app/championships/$championshipId/players/(players)/index.tsx`:
  - Tabela: nome, número, time, gols, cartões
  - Filtro por time (`nuqs: parseAsString` para `teamId`)
  - Dialog criar/editar com select de time
  - Confirmar exclusão com `AlertDialog`
  - `invalidate fetchPlayersQueryKey({ championshipId })` após mutations

- [x] `-components/player-form.tsx` — select de time carregado via `useFetchTeams`

---

## S09 — Estrutura da competição

**Objetivo:** Configurar fases, grupos e rodadas; visualizar a árvore da competição.

**Depende de:** S07

**Endpoints:**
- `POST /championships/:championshipId/stages/setup` — reset completo + recriação
- `GET /championships/:championshipId/stages`
- `GET /championships/:championshipId/structure` — fases + grupos + rodadas aninhados

**Body do setup em lote:**
```ts
{
  stages: Array<{
    name: string
    type: 'GROUP_STAGE' | 'KNOCKOUT'
    order: number
    format?: 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN'
    teamsToAdvance?: number
    qualifiedTeams?: number
    thirdPlaceMatch?: boolean
    groups?: Array<{ name: string; teams: number }>
  }>
}
```

**Response `GET /structure`:**
```ts
{
  data: {
    stages: Array<{
      id, name, type, format, teamsToAdvance, thirdPlaceMatch, displayOrder
      groups: Array<{ id, stageId, name, displayOrder }>
      rounds: Array<{ id, stageId, number, name }>
    }>
  }
}
```

### HTTP

- [x] `src/http/types/stages/stage.ts` — `Stage`, `Group`, `Round`, `StageWithStructure`
- [x] `src/http/types/stages/fetch-stages.ts`
- [x] `src/http/types/stages/get-championship-structure.ts`
- [x] `src/http/types/stages/setup-stages.ts`
- [x] `src/http/hooks/stages/use-fetch-stages.ts`
- [x] `src/http/hooks/stages/use-get-championship-structure.ts`
- [x] `src/http/hooks/stages/use-setup-stages.ts`
- [x] Re-export em `src/http/index.ts`

### Páginas

- [x] `src/pages/_app/championships/$championshipId/structure/index.tsx`:
  - Visualização em cards aninhados: fases → grupos → rodadas
  - Empty state: "Competição sem estrutura" + botão "Configurar"
  - Botão "Reconfigurar" sempre visível

- [x] `-components/setup-stages-form.tsx`:
  - Formulário para adicionar fases dinamicamente (adicionar/remover fase)
  - Tipo GROUP_STAGE exige grupos; KNOCKOUT não
  - **`AlertDialog` de confirmação:** "Isso apagará toda a estrutura atual e partidas não encerradas"
  - `onSuccess` → `invalidate getChampionshipStructureQueryKey(id)` + `invalidate fetchStagesQueryKey(id)`

---

## S10 — Partidas

**Objetivo:** Calendário operacional — criar, listar e editar partidas.

**Depende de:** S09 (rounds necessários para criar partida)

**Endpoints:**
- `GET /championships/:championshipId/matches?roundId=&groupId=&status=`
- `POST /championships/:championshipId/matches`
- `GET /championships/:championshipId/matches/:matchId`
- `PUT /championships/:championshipId/matches/:matchId`

**Tipo Match:**
```ts
type Match = {
  id: string; championshipId: string; roundId: string
  groupId: string | null
  homeTeamId: string | null; awayTeamId: string | null
  scheduledAt: Date | null
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'
  createdAt: Date; updatedAt: Date
}
```

**Body criar:** `{ roundId, groupId?, homeTeamId?, awayTeamId?, scheduledAt? }`
**Body editar (PUT):** `{ homeTeamId?, awayTeamId?, scheduledAt? }`

### HTTP

- [x] `src/http/types/matches/match.ts` — `Match`, `MatchStatus`
- [x] `src/http/types/matches/fetch-matches.ts` — params: `{ championshipId, roundId?, groupId?, status? }`
- [x] `src/http/types/matches/create-match.ts`
- [x] `src/http/types/matches/get-match.ts`
- [x] `src/http/types/matches/update-match.ts`
- [x] `src/http/hooks/matches/use-fetch-matches.ts`
- [x] `src/http/hooks/matches/use-create-match.ts`
- [x] `src/http/hooks/matches/use-get-match.ts`
- [x] `src/http/hooks/matches/use-update-match.ts`
- [x] Re-export em `src/http/index.ts`

### Páginas

- [x] `src/pages/_app/championships/$championshipId/matches/(matches)/index.tsx`:
  - Tabela: mandante × visitante, data/hora, status
  - Filtros (`nuqs`): `stageId`, `roundId`, `groupId`, `status` (selects em cascata)
  - Botão "Nova partida" → página de criação
  - Linha clicável → `$matchId/index.tsx`

- [x] `src/pages/_app/championships/$championshipId/matches/create/index.tsx`:
  - Form: select fase → select rodada (em cascata), select grupo (GROUP_STAGE), times, data/hora
  - `onSuccess` → `invalidate fetchMatchesQueryKey(championshipId)` + navigate para detalhe

- [x] `src/pages/_app/championships/$championshipId/matches/$matchId/index.tsx`:
  - Detalhe básico da partida (times, horário, status)
  - Botão "Editar" abre Dialog para alterar times/horário
  - Placeholder para seção de eventos (S11)

---

## S11 — Partida ao vivo + eventos

**Objetivo:** Organizar e registrar eventos durante a partida; encerrar com placar oficial.

**Depende de:** S10

> **Este step inclui mudanças no backend.** Implementar as alterações de backend antes da UI.

### Backend — mudanças necessárias

#### 1. Endpoint para iniciar partida

Documentar em `api-spec.md` e implementar no backend:

```
PATCH /championships/:championshipId/matches/:matchId/status
Body: { "status": "IN_PROGRESS" | "CANCELLED" }
Permission: Owner, Administrator, Organizer
Regra: só aceita IN_PROGRESS se status atual for SCHEDULED; CANCELLED se não for FINISHED
Response: { "data": { "match": Match } }
```

**Arquivos backend:**
- `backend/src/http/schemas/matches/update-match-status.schema.ts`
- `backend/src/use-cases/matches/update-match-status.ts`
- `backend/src/http/controllers/matches/update-match-status.controller.ts`
- Registrar em `backend/src/http/routes/match.routes.ts`

#### 2. Endpoint para listar eventos da partida

```
GET /championships/:championshipId/matches/:matchId/events
Response: { "data": { "events": MatchEvent[] } }
```

**Arquivos backend:**
```ts
// Já existe: PrismaMatchEventRepository.findByMatchId(matchId)
// Criar:
// - backend/src/http/schemas/match-events/list-match-events.schema.ts
// - backend/src/use-cases/match-events/list-match-events.ts
// - backend/src/http/controllers/match-events/list-match-events.controller.ts
// - Registrar na rota de matchEventRoutes
```

### Frontend

**Tipos:**
```ts
type MatchEvent = {
  id: string; matchId: string
  playerId: string | null; teamId: string | null
  eventType: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'MVP'
  minute: number | null; notes: string | null
  createdAt: Date
}
```

**Body dos eventos:**
```ts
// Gol, amarelo, vermelho
{ playerId: string; minute?: number | null }
// MVP
{ playerId: string }
// Resultado final
{ homeScore: number; awayScore: number; homePenaltyScore?: number | null; awayPenaltyScore?: number | null }
```

### HTTP

- [x] `src/http/types/matches/update-match-status.ts`
- [x] `src/http/types/matches/register-match-result.ts`
- [x] `src/http/types/match-events/match-event.ts` — `MatchEvent`, `MatchEventType`
- [x] `src/http/types/match-events/fetch-match-events.ts`
- [x] `src/http/types/match-events/register-goal.ts`
- [x] `src/http/types/match-events/register-yellow-card.ts`
- [x] `src/http/types/match-events/register-red-card.ts`
- [x] `src/http/types/match-events/define-match-mvp.ts`
- [x] `src/http/hooks/matches/use-update-match-status.ts`
- [x] `src/http/hooks/matches/use-register-match-result.ts`
- [x] `src/http/hooks/match-events/use-fetch-match-events.ts`
- [x] `src/http/hooks/match-events/use-register-goal.ts`
- [x] `src/http/hooks/match-events/use-register-yellow-card.ts`
- [x] `src/http/hooks/match-events/use-register-red-card.ts`
- [x] `src/http/hooks/match-events/use-define-match-mvp.ts`
- [x] Re-export em `src/http/index.ts`

### Painel ao vivo — atualizar `$matchId/index.tsx`

- [x] Loader: `ensureQueryData(getMatchQueryOptions(...))` + `ensureQueryData(fetchMatchEventsQueryOptions(...))`
- [x] Placar ao vivo calculado do state de eventos: `events.filter(e => e.eventType === 'GOAL' && e.teamId === homeTeamId).length`
- [x] Timeline de eventos ordenada por `createdAt` desc: ícone + jogador + minuto
- [x] Botão "Iniciar partida" visível quando `status === 'SCHEDULED'`
- [x] Painel de ações visível quando `status === 'IN_PROGRESS'`:
  - Botão "+ Gol" → Dialog (select jogador por time + minuto)
  - Botão "+ Amarelo" → idem
  - Botão "+ Vermelho" → idem
- [x] Botão "Encerrar partida" quando `IN_PROGRESS`:
  - Dialog: placar pré-preenchido pelos gols registrados (editável)
  - Campos de pênaltis opcionais
  - `POST .../result` → match fica `FINISHED`
- [x] Após MVP disponível (status `FINISHED`): botão "Definir MVP"
- [x] Cada mutation faz `invalidate fetchMatchEventsQueryKey(matchId)` + `invalidate getMatchQueryKey(...)`

---

## S12 — Classificação

**Objetivo:** Tabela de classificação por grupo.

**Depende de:** S11 (classificação só faz sentido com partidas com resultado)

**Endpoint:** `GET /championships/:championshipId/standings`

**Response:** `{ data: StandingEntry[] }`

```ts
type StandingEntry = {
  teamId: string; position: number; points: number
  wins: number; draws: number; losses: number
  goalsScored: number; goalsConceded: number; goalDifference: number
}
```

### HTTP

- [x] `src/http/types/standings/standings.ts` — `StandingEntry`
- [x] `src/http/types/standings/get-standings.ts`
- [x] `src/http/hooks/standings/use-get-standings.ts`
- [x] Re-export em `src/http/index.ts`

### Página

- [x] `src/pages/_app/championships/$championshipId/standings/index.tsx`:
  - Loader: `ensureQueryData(getStandingsQueryOptions(championshipId))`
  - Tabela: pos., time (nome via times carregados), PJ, V, E, D, GP, GC, SG, Pts
  - Filtro por grupo/fase quando a response incluir agrupamento
  - Somente leitura

---

## S13 — Regras

**Objetivo:** Regulamento do campeonato e critérios de desempate.

**Depende de:** S04

**Endpoints:**
- `GET /championships/:championshipId/rules`
- `PUT /championships/:championshipId/rules`
- `GET /championships/:championshipId/rules/tie-breakers`
- `PUT /championships/:championshipId/rules/tie-breakers`

**Tipos:**
```ts
type ChampionshipRules = {
  winPoints: number; drawPoints: number; penaltyBonusPoints: number
  yellowCardsForSuspension: number; redCardSuspensionGames: number
  createdAt: Date | null; updatedAt: Date | null
}

type TieBreakerRule = { id?: string; position: number; criterion: string }
```

**Body PUT rules:** todos os campos opcionais (inteiros `>= 0`)
**Body PUT tie-breakers:** `{ rules: Array<{ position: number; criterion: string }> }`

### HTTP

- [x] `src/http/types/rules/championship-rules.ts`
- [x] `src/http/types/rules/tie-breaker-rules.ts`
- [x] `src/http/hooks/rules/use-get-championship-rules.ts`
- [x] `src/http/hooks/rules/use-update-championship-rules.ts`
- [x] `src/http/hooks/rules/use-fetch-tie-breaker-rules.ts`
- [x] `src/http/hooks/rules/use-update-tie-breaker-rules.ts`
- [x] Re-export em `src/http/index.ts`

### Página

- [x] `src/pages/_app/championships/$championshipId/rules/index.tsx`:
  - Seção "Pontuação": form com campos numéricos (vitória, empate, pênalti bonus)
  - Seção "Suspensões": amarelos para suspensão, jogos de suspensão por vermelho
  - Seção "Critérios de desempate": lista ordenável (drag ou botões up/down)
  - Restringir edição a Owner/Admin (via role do membro logado)
  - `onSuccess` → `invalidate` + toast

---

## S14 — Premiações

**Objetivo:** Listar e conceder prêmios a jogadores.

**Depende de:** S08, S11

**Endpoints:**
- `GET /championships/:championshipId/awards`
- `POST /championships/:championshipId/awards`

**Tipos:**
```ts
type Award = {
  id: string; championshipId: string; playerId: string
  awardType: 'TOP_SCORER' | 'MATCH_MVP' | 'TOURNAMENT_MVP' | 'FAIR_PLAY'
  createdAt: Date
}

// Body POST
{ playerId: string; type: AwardType }
```

### HTTP

- [x] `src/http/types/awards/award.ts` — `Award`, `AwardType`
- [x] `src/http/types/awards/fetch-awards.ts`
- [x] `src/http/types/awards/grant-award.ts`
- [x] `src/http/hooks/awards/use-fetch-awards.ts`
- [x] `src/http/hooks/awards/use-grant-award.ts`
- [x] Re-export em `src/http/index.ts`

### Página

- [x] `src/pages/_app/championships/$championshipId/awards/index.tsx`:
  - Lista de premiações concedidas (tipo + jogador)
  - Botão "Conceder prêmio" → Dialog: select tipo + select jogador
  - `onSuccess` → `invalidate fetchAwardsQueryKey(championshipId)` + toast

### Labels de tipo

| AwardType | Label |
| --- | --- |
| `TOP_SCORER` | Artilheiro |
| `MATCH_MVP` | MVP da Partida |
| `TOURNAMENT_MVP` | MVP do Torneio |
| `FAIR_PLAY` | Fair Play |

---

## S15 — Portal público

**Objetivo:** Página pública acessível sem login.

**Depende de:** S02+ (campeonato existente com slug)

**Endpoints (sem auth):**

| Método | Endpoint |
| --- | --- |
| GET | `/public/championships/:slug` |
| GET | `/public/championships/:slug/structure` |
| GET | `/public/championships/:slug/standings?stageId=&groupId=` |
| GET | `/public/championships/:slug/matches?roundId=&groupId=&status=` |
| GET | `/public/championships/:slug/players` |

### HTTP

- [x] `src/http/types/public/public-championship.ts`
- [x] `src/http/types/public/public-structure.ts`
- [x] `src/http/types/public/public-standings.ts`
- [x] `src/http/types/public/public-matches.ts`
- [x] `src/http/types/public/public-players.ts`
- [x] `src/http/hooks/public/use-get-public-championship.ts`
- [x] `src/http/hooks/public/use-get-public-structure.ts`
- [x] `src/http/hooks/public/use-get-public-standings.ts`
- [x] `src/http/hooks/public/use-fetch-public-matches.ts`
- [x] `src/http/hooks/public/use-fetch-public-players.ts`
- [x] Re-export em `src/http/index.ts`

> Os hooks públicos usam o mesmo `client`, mas sem `Authorization` (token não existe para usuário anônimo — o interceptor só adiciona o header quando `accessToken` existe no store).

### Rotas

```text
src/pages/c/
└── $slug/
    ├── layout.tsx          → loader: getPublicChampionship(slug)
    ├── index.tsx           → overview: descrição, datas, status
    ├── standings/
    │   └── index.tsx       → classificação pública
    ├── matches/
    │   └── index.tsx       → partidas com filtros
    ├── players/
    │   └── index.tsx       → elencos por time
    └── structure/
        └── index.tsx       → árvore de fases
```

- [x] `layout.tsx`:
  - **Sem guard de auth** (não usa `beforeLoad`)
  - Loader: `ensureQueryData(getPublicChampionshipQueryOptions(slug))`
  - Header com nome do campeonato + abas de navegação
  - Link "Gerenciar" → `/` (visível apenas se autenticado via `useAuthStore`)

- [x] Cada sub-rota com sua query + UI correspondente
- [x] Mobile-first (colunas adaptativas, tabelas com scroll horizontal)

---

## S16 — Redesign telas de auth (identidade visual)

**Objetivo:** Aplicar o tema verde escuro nas telas de autenticação.

**Depende de:** S00 (tema já aplicado)

> Este step é puramente visual — sem mudanças de lógica.

### Telas a atualizar

- `src/pages/_auth/layout.tsx`
- `src/pages/_auth/sign-in/index.tsx` e `-components/sign-in-form.tsx`
- `src/pages/_auth/register/index.tsx` e `-components/register-form.tsx`
- `src/pages/_auth/forgot-password/index.tsx` e `-components/forgot-password-form.tsx`
- `src/pages/_auth/reset-password/index.tsx` e `-components/reset-password-form.tsx`

### Checklist

- [x] `_auth/layout.tsx` — fundo com gradiente verde escuro (igual ao `body` global)
- [x] Card centralizado com borda sutil (`border border-border/50 bg-card/80 backdrop-blur`)
- [x] Logo do Copa Manager no topo do card
- [x] Inputs e botões usando as variáveis `--primary` verdes definidas em S00
- [x] Conferir contraste de todos os labels e mensagens de erro
- [x] Testar responsividade mobile

---

## Mapa completo de endpoints → hooks

| Endpoint | Hook | Step |
| --- | --- | --- |
| `GET /championships` | `useFetchChampionships` | S02 |
| `POST /championships` | `useCreateChampionship` | S03 |
| `GET /championships/:id` | `useGetChampionship` | S04 |
| `PUT /championships/:id` | `useUpdateChampionship` | S05 |
| `DELETE /championships/:id` | `useDeleteChampionship` | S05 |
| `GET /championships/:id/members` | `useFetchMembers` | S06 |
| `POST /championships/:id/members/invite` | `useInviteMember` | S06 |
| `PATCH /championships/:id/members/:memberId` | `useUpdateMemberRole` | S06 |
| `DELETE /championships/:id/members/:memberId` | `useRemoveMember` | S06 |
| `POST /invitations/accept` | `useAcceptInvitation` | S06 |
| `GET /championships/:id/teams` | `useFetchTeams` | S07 |
| `POST /championships/:id/teams` | `useCreateTeam` | S07 |
| `PUT /championships/:id/teams/:teamId` | `useUpdateTeam` | S07 |
| `DELETE /championships/:id/teams/:teamId` | `useDeleteTeam` | S07 |
| `GET /championships/:id/players` | `useFetchPlayers` | S08 |
| `POST /championships/:id/players` | `useCreatePlayer` | S08 |
| `PUT /championships/:id/players/:playerId` | `useUpdatePlayer` | S08 |
| `DELETE /championships/:id/players/:playerId` | `useDeletePlayer` | S08 |
| `POST /championships/:id/stages/setup` | `useSetupStages` | S09 |
| `GET /championships/:id/stages` | `useFetchStages` | S09 |
| `GET /championships/:id/structure` | `useGetChampionshipStructure` | S09 |
| `GET /championships/:id/matches` | `useFetchMatches` | S10 |
| `POST /championships/:id/matches` | `useCreateMatch` | S10 |
| `GET /championships/:id/matches/:matchId` | `useGetMatch` | S10 |
| `PUT /championships/:id/matches/:matchId` | `useUpdateMatch` | S10 |
| `PATCH /championships/:id/matches/:matchId/status` *(backend novo)* | `useUpdateMatchStatus` | S11 |
| `POST /championships/:id/matches/:matchId/result` | `useRegisterMatchResult` | S11 |
| `GET /championships/:id/matches/:matchId/events` *(backend novo)* | `useFetchMatchEvents` | S11 |
| `POST .../events/goal` | `useRegisterGoal` | S11 |
| `POST .../events/yellow-card` | `useRegisterYellowCard` | S11 |
| `POST .../events/red-card` | `useRegisterRedCard` | S11 |
| `POST .../mvp` | `useDefineMatchMvp` | S11 |
| `GET /championships/:id/standings` | `useGetStandings` | S12 |
| `GET /championships/:id/rules` | `useGetChampionshipRules` | S13 |
| `PUT /championships/:id/rules` | `useUpdateChampionshipRules` | S13 |
| `GET /championships/:id/rules/tie-breakers` | `useFetchTieBreakerRules` | S13 |
| `PUT /championships/:id/rules/tie-breakers` | `useUpdateTieBreakerRules` | S13 |
| `GET /championships/:id/awards` | `useFetchAwards` | S14 |
| `POST /championships/:id/awards` | `useGrantAward` | S14 |
| `GET /public/championships/:slug` | `useGetPublicChampionship` | S15 |
| `GET /public/championships/:slug/structure` | `useGetPublicStructure` | S15 |
| `GET /public/championships/:slug/standings` | `useGetPublicStandings` | S15 |
| `GET /public/championships/:slug/matches` | `useFetchPublicMatches` | S15 |
| `GET /public/championships/:slug/players` | `useFetchPublicPlayers` | S15 |

---

## Matriz de permissões na UI

Referência: `api-spec.md` — Authorization Matrix

| Ação | Owner | Administrator | Organizer |
| --- | --- | --- | --- |
| Editar campeonato | ✅ | ✅ | ❌ |
| Excluir campeonato | ✅ | ❌ | ❌ |
| Gerenciar membros | ✅ | ✅ | ❌ |
| Configurar estrutura | ✅ | ✅ | ❌ |
| Gerenciar times | ✅ | ✅ | ✅ |
| Gerenciar jogadores | ✅ | ✅ | ✅ |
| Criar/editar partidas | ✅ | ✅ | ✅ |
| Registrar eventos | ✅ | ✅ | ✅ |

> A UI esconde botões/ações conforme o papel. O backend é a fonte da verdade — erros de permissão devem ser tratados com `errorHandler + toast`.

---

## Estrutura final de pastas

```text
frontend/src/
├── pages/
│   ├── app/
│   │   ├── index.tsx                          # S02 — Dashboard
│   │   └── championships/
│   │       ├── create/index.tsx               # S03
│   │       └── $championshipId/
│   │           ├── layout.tsx                 # S04
│   │           ├── index.tsx                  # S04 — overview
│   │           ├── settings/index.tsx         # S05
│   │           ├── members/index.tsx          # S06
│   │           ├── teams/(teams)/index.tsx    # S07
│   │           ├── players/(players)/         # S08
│   │           ├── structure/index.tsx        # S09
│   │           ├── matches/
│   │           │   ├── (matches)/index.tsx    # S10
│   │           │   ├── create/index.tsx       # S10
│   │           │   └── $matchId/index.tsx     # S10 + S11
│   │           ├── standings/index.tsx        # S12
│   │           ├── rules/index.tsx            # S13
│   │           └── awards/index.tsx           # S14
│   ├── invitations/accept/index.tsx           # S06
│   └── c/$slug/                               # S15 — portal público
│       ├── layout.tsx
│       ├── index.tsx
│       ├── standings/index.tsx
│       ├── matches/index.tsx
│       ├── players/index.tsx
│       └── structure/index.tsx
├── http/
│   ├── types/
│   │   ├── championships/
│   │   ├── members/
│   │   ├── teams/
│   │   ├── players/
│   │   ├── stages/
│   │   ├── matches/
│   │   ├── match-events/
│   │   ├── standings/
│   │   ├── rules/
│   │   ├── awards/
│   │   └── public/
│   └── hooks/
│       ├── championships/
│       ├── members/
│       ├── teams/
│       ├── players/
│       ├── stages/
│       ├── matches/
│       ├── match-events/
│       ├── standings/
│       ├── rules/
│       ├── awards/
│       └── public/
└── constants/nav.ts
```

---

## Ritual por step (copiar como checklist ao implementar)

```text
1. Ler requirements.md + api-spec.md da feature
2. Verificar schema Zod do backend (campos e tipos exatos)
3. Criar tipos em src/http/types/<domínio>/
4. Criar hook em src/http/hooks/<domínio>/
5. Re-exportar em src/http/index.ts
6. Criar rota + -components/
7. Form: RHF + Zod + FormErrorMessage + ButtonLoading
8. Erros: errorHandler + toast
9. onSuccess das mutations: invalidateQueries + navigate/toast
10. Testar fluxo completo manualmente
11. Marcar checkboxes neste documento
```
