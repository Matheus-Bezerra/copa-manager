# Backend Implementation Checklist

Checklist de implementação do backend por PR/fatia. Referências: [requirements.md](./requirements.md), [domain-model.md](./domain-model.md), [database-design.md](./database-design.md), [api-spec.md](./api-spec.md), [architecture-backend.md](./architecture-backend.md).

---

## Legenda

| Símbolo | Significado |
| --- | --- |
| `[ ]` | Pendente |
| `[x]` | Concluído |
| `—` | Já existia antes deste checklist |

## Definition of Done (por PR)

- [ ] Migration aplicada (quando houver alteração de schema)
- [ ] Repositórios com interface + implementação Prisma
- [ ] Use cases com regras de negócio
- [ ] Schemas Zod + controllers + rotas registradas em `app.ts`
- [ ] Autorização aplicada (`championship-authorization`)
- [ ] Erros em `constants/error-message.ts`
- [ ] Swagger reflete request/response
- [ ] Happy path testável manualmente (curl/Scalar) ou via seed

## Decisões fechadas

| Decisão | Escolha |
| --- | --- |
| Consulta agregada | `GET /championships/{championshipId}/structure` |
| Setup duplicado | `POST /stages/setup` faz **reset completo** (apaga estrutura anterior e recria) |
| Chave KNOCKOUT no setup | Cria partidas **placeholder** (`home_team_id` / `away_team_id` nulos) + `MatchBracketLink` na mesma transação |
| Avanço automático | Incluído na v1 (PR 5) |
| Ordem de implementação | Fatias verticais — ver PRs abaixo |

---

## Ordem de execução

```text
PR1 Schema
  → PR2 Setup + Structure
    → PR3 Matches (GROUP_STAGE)
      → PR4 Results + Standings
        → PR5 Avanço automático
          → PR6 Eventos + stats
            → PR7 Rules
            → PR8 Awards
              → PR9 Público
                → PR10 Seeds + polish
```

---

## Baseline — já implementado

| Domínio | Endpoints / artefatos | Status |
| --- | --- | --- |
| Auth | register, login, refresh, logout, forgot/reset/change password | — |
| User | `GET /users/me` | — |
| Championships | CRUD completo | — |
| Members | invite, accept, list, update role, remove | — |
| Teams | CRUD | — |
| Players | CRUD | — |
| Público | `GET /public/championships/:slug`, `GET .../players` | — |
| Match repository | `src/repositories/match-repository.ts` | stub vazio |

---

## Template de camadas (repetir em cada PR)

Para cada feature nova:

- [ ] Interface em `backend/src/repositories/`
- [ ] Implementação em `backend/src/prisma/repositories/`
- [ ] Use case em `backend/src/use-cases/{domínio}/`
- [ ] Schema Zod em `backend/src/http/schemas/{domínio}/`
- [ ] Controller em `backend/src/http/controllers/{domínio}/`
- [ ] Rota em `backend/src/http/routes/` + registro em `app.ts`
- [ ] Autorização via `services/championship/championship-authorization.ts`
- [ ] Erros em `constants/error-message.ts`

Fluxo obrigatório: **Controller → Use Case → Repository → Prisma** (Prisma só em `prisma/repositories/`).

---

## PR 1 — Schema e repositórios

**Objetivo:** Banco pronto para competição; repositórios base sem endpoints HTTP (ou mínimo interno).

**Depende de:** —

### Prisma — enums

- [x] `StageType` (`GROUP_STAGE`, `KNOCKOUT`)
- [x] `StageFormat` (`ROUND_ROBIN`, `DOUBLE_ROUND_ROBIN`)
- [x] `MatchStatus` (`SCHEDULED`, `IN_PROGRESS`, `FINISHED`, `CANCELLED`)
- [x] `MatchEventType` (`GOAL`, `YELLOW_CARD`, `RED_CARD`, `MVP`)
- [x] `BracketLinkOutcome` (`WINNER`, `LOSER`)
- [x] `BracketLinkSlot` (`HOME`, `AWAY`)
- [x] `AwardType` (`TOP_SCORER`, `MATCH_MVP`, `TOURNAMENT_MVP`, `FAIR_PLAY`)

### Prisma — modelos

- [x] `Stage` — `format`, `teams_to_advance`, `qualified_teams`, `third_place_match`, `display_order`
- [x] `Group` — `stage_id`, `name`, `display_order`
- [x] `Round` — `stage_id`, `number`, `name`; unique `(stage_id, number)`
- [x] `Match` — `round_id`, `group_id` nullable, `home_team_id` / `away_team_id` nullable, `scheduled_at`, `status`
- [x] `MatchResult` — scores + penalty scores; unique `match_id`
- [x] `MatchEvent` — `match_id`, `player_id`, `team_id`, `event_type`, `minute`
- [x] `MatchBracketLink` — `from_match_id`, `to_match_id`, `outcome`, `to_slot`; unique `(from_match_id, outcome)`
- [x] `Standing` — `stage_id`, `group_id`, `team_id`, stats; unique `(stage_id, group_id, team_id)`
- [x] `ChampionshipRules` — unique `championship_id`
- [x] `TieBreakerRule` — `championship_id`, `position`, `criterion`
- [x] `Award` — `championship_id`, `player_id`, `award_type`
- [x] Relacionamentos e índices conforme [database-design.md](./database-design.md)
- [x] Migration: `npx prisma migrate dev`

### Repositories — interfaces

- [x] `stage-repository.ts`
- [x] `group-repository.ts`
- [x] `round-repository.ts`
- [x] `match-repository.ts` (substituir stub)
- [x] `match-bracket-link-repository.ts`
- [x] `standing-repository.ts`
- [x] `championship-rules-repository.ts`
- [x] `tie-breaker-rule-repository.ts`
- [x] `award-repository.ts`

### Repositories — Prisma

- [x] `prisma-stage-repository.ts`
- [x] `prisma-group-repository.ts`
- [x] `prisma-round-repository.ts`
- [x] `prisma-match-repository.ts`
- [x] `prisma-match-bracket-link-repository.ts`
- [x] `prisma-standing-repository.ts`
- [x] `prisma-championship-rules-repository.ts`
- [x] `prisma-tie-breaker-rule-repository.ts`
- [x] `prisma-award-repository.ts`

### DoD PR1

- [x] Client Prisma gera sem erro
- [x] Repositórios expõem CRUD/list mínimo por entidade

---

## PR 2 — Estrutura: setup em lote + consulta agregada

**Objetivo:** Wizard do front funciona; campeonato ganha fases, grupos, rodadas e chave KNOCKOUT placeholder.

**Depende de:** PR 1

### Services (`src/services/competition/`)

- [x] `calculate-group-stage-rounds.ts` — `ROUND_ROBIN` → `N-1` (par) / `N` (ímpar); `DOUBLE_ROUND_ROBIN` → dobro; usa maior `teams` entre grupos
- [x] `calculate-knockout-rounds.ts` — nomes por `qualifiedTeams` (Semifinal, Final, 3º Lugar, etc.)
- [x] `generate-knockout-bracket.ts` — partidas placeholder + `MatchBracketLink` (WINNER/LOSER, HOME/AWAY)
- [x] `validate-setup-payload.ts` — `order` único, `format` em GROUP_STAGE, `qualifiedTeams` potência de 2, grupos obrigatórios em GROUP_STAGE

### Use cases

- [x] `setup-stages.ts` — transação: **apaga estrutura anterior** → stages → groups → rounds → matches placeholder → bracket links
- [x] `create-stage.ts` — individual; `displayOrder` auto-atribuído
- [x] `list-stages.ts`
- [x] `get-championship-structure.ts` — árvore agregada ordenada
- [x] `create-group.ts` — `displayOrder` auto-atribuído
- [x] `list-groups.ts`
- [x] `create-round.ts` — `number` auto-atribuído
- [x] `list-rounds.ts`

### HTTP — endpoints

- [x] `POST /championships/{championshipId}/stages/setup`
- [x] `POST /championships/{championshipId}/stages`
- [x] `GET /championships/{championshipId}/stages`
- [x] `GET /championships/{championshipId}/structure`
- [x] `POST /championships/{championshipId}/stages/{stageId}/groups`
- [x] `GET /championships/{championshipId}/stages/{stageId}/groups`
- [x] `POST /championships/{championshipId}/stages/{stageId}/rounds`
- [x] `GET /championships/{championshipId}/stages/{stageId}/rounds`

### HTTP — artefatos

- [x] `http/schemas/stages/` (setup, create, list, structure)
- [x] `http/schemas/groups/`
- [x] `http/schemas/rounds/`
- [x] `http/controllers/stages/`
- [x] `http/routes/stage.routes.ts` + registro em `app.ts`
- [x] Autorização: Owner + Administrator ("Gerenciar fases")
- [x] `errorMessage`: setup inválido, stage not found, duplicate order, etc.

### Validação manual

- [ ] Payload exemplo api-spec (2 grupos × 4 times + mata-mata 4) → 6 rodadas GROUP + 2–3 rodadas KNOCKOUT
- [ ] `GET /structure` retorna árvore com groups e rounds aninhados
- [ ] Segundo `POST /setup` no mesmo campeonato substitui estrutura anterior
- [ ] KNOCKOUT: partidas criadas com times null; links persistidos

### DoD PR2

- [x] Setup idempotente via reset (não duplica fases)
- [x] `teamsToAdvance` persistido em `Stage`

---

## PR 3 — Partidas (GROUP_STAGE + listagem KNOCKOUT)

**Objetivo:** Criar e listar jogos; placeholders KNOCKOUT visíveis na listagem.

**Depende de:** PR 2

### Use cases

- [x] `create-match.ts` — `roundId`, `groupId` obrigatório em GROUP_STAGE; times do campeonato; home ≠ away
- [x] `list-matches.ts` — filtros `roundId`, `groupId`
- [x] `get-match.ts`
- [x] `update-match.ts` — agendar, alterar times (quando permitido)
- [x] `cancel-match.ts` — status `CANCELLED`

### HTTP — endpoints

- [x] `POST /championships/{championshipId}/matches`
- [x] `GET /championships/{championshipId}/matches?roundId=&groupId=`
- [x] `GET /championships/{championshipId}/matches/{matchId}`
- [x] `PUT /championships/{championshipId}/matches/{matchId}`

### HTTP — artefatos

- [x] `http/schemas/matches/`
- [x] `http/controllers/matches/`
- [x] `http/routes/match.routes.ts` + registro em `app.ts`
- [x] Autorização: Owner + Administrator + Organizer ("Registrar partidas")

### DoD PR3

- [x] Partida só em round/group/stage coerentes
- [x] Listagem retorna placeholders KNOCKOUT com `homeTeamId` / `awayTeamId` null

---

## PR 4 — Resultados + classificação

**Objetivo:** Placar atualiza tabela por grupo.

**Depende de:** PR 3

### Services

- [x] `standings-calculator.ts` — pontos, V/E/D, gols, saldo (defaults até PR7)
- [x] `tie-breaker.ts` — ordenação por critérios documentados

### Use cases

- [x] `register-match-result.ts` — cria/atualiza `MatchResult`; status `FINISHED`; desempate por pênaltis
- [x] `recalculate-standings.ts` — por `(stageId, groupId)` após resultado
- [x] `get-standings.ts` — query `stageId` + `groupId`

### HTTP — endpoints

- [x] `POST /championships/{championshipId}/matches/{matchId}/result`
- [x] `GET /championships/{championshipId}/standings?stageId=&groupId=`

### DoD PR4

- [x] Standing derivado de partidas; nunca editável via API direta
- [x] Alteração/remoção de resultado recalcula standings afetados

---

## PR 5 — Avanço automático

**Objetivo:** Resultado empurra times na chave; grupos alimentam mata-mata.

**Depende de:** PR 4

### Services

- [x] `advance-winner-in-bracket.ts` — lê `MatchBracketLink` WINNER → preenche slot HOME/AWAY
- [x] `advance-loser-to-third-place.ts` — LOSER de semifinal → rodada 3º Lugar
- [x] `advance-group-stage-classified.ts` — fase GROUP_STAGE completa → 1ª rodada KNOCKOUT seguinte (`teamsToAdvance`, ordem dos grupos)
- [x] `revert-bracket-cascade.ts` — ao alterar/remover resultado, limpa vagas afetadas em cascata

### Use cases

- [x] Integrar avanço em `register-match-result.ts` (hook pós-encerramento)
- [x] (opcional) `process-match-finished.ts` — orquestrador de avanço

### Regras de negócio

- [x] KNOCKOUT: vencedor (incl. pênaltis) avança para partida destino
- [x] KNOCKOUT: perdedores semifinal → 3º Lugar quando `thirdPlaceMatch: true`
- [x] GROUP_STAGE: todas partidas da fase encerradas → classificados preenchem 1ª rodada da fase KNOCKOUT imediatamente posterior
- [x] Reversão não deixa times fantasma na rodada seguinte

### DoD PR5

- [x] Fluxo completo: semifinal → final + 3º lugar
- [x] Fluxo completo: fase de grupos → vagas no mata-mata

---

## PR 6 — Eventos de partida + estatísticas

**Objetivo:** Gols, cartões e MVP atualizam `PlayerStatistics`.

**Depende de:** PR 4

### Use cases

- [x] `register-goal.ts`
- [x] `register-yellow-card.ts`
- [x] `register-red-card.ts`
- [x] `define-match-mvp.ts`
- [x] Atualização incremental de `PlayerStatistics`

### HTTP — endpoints

- [x] `POST /championships/{championshipId}/matches/{matchId}/events/goal`
- [x] `POST /championships/{championshipId}/matches/{matchId}/events/yellow-card`
- [x] `POST /championships/{championshipId}/matches/{matchId}/events/red-card`
- [x] `POST /championships/{championshipId}/matches/{matchId}/mvp`

### DoD PR6

- [x] Eventos impactam stats do jogador
- [x] Regra de status da partida para registrar evento definida e documentada

---

## PR 7 — Regras do campeonato

**Objetivo:** Pontos e desempate configuráveis por campeonato.

**Depende de:** PR 4

### Use cases

- [x] `get-championship-rules.ts`
- [x] `update-championship-rules.ts`
- [x] `list-tie-breaker-rules.ts`
- [x] `update-tie-breaker-rules.ts` (ou CRUD)
- [x] Integrar `ChampionshipRules` e `TieBreakerRule` no `standings-calculator`

### DoD PR7

- [x] Standings respeitam rules do campeonato
- [x] Default sensato quando rules ausentes

---

## PR 8 — Premiações

**Objetivo:** Artilheiro, MVP torneio, etc.

**Depende de:** PR 6 (recomendado)

### Use cases

- [x] `list-awards.ts`
- [x] `grant-award.ts`

### HTTP — endpoints

- [x] `GET /championships/{championshipId}/awards`
- [x] `POST /championships/{championshipId}/awards`

### DoD PR8

- [x] Grant award valida player do campeonato

---

## PR 9 — Portal público (competição)

**Objetivo:** Espectador vê structure, standings e matches.

**Depende de:** PR 2, PR 3, PR 4

### Use cases

- [x] `get-public-structure.ts`
- [x] `get-public-standings.ts`
- [x] `list-public-matches.ts`

### HTTP — endpoints

- [x] `GET /public/championships/{slug}/structure`
- [x] `GET /public/championships/{slug}/standings?stageId=&groupId=`
- [x] `GET /public/championships/{slug}/matches?roundId=&groupId=`

### Artefatos

- [x] Estender `public.routes.ts`
- [x] Schemas em `http/schemas/public/`

### DoD PR9

- [x] Sem autenticação; slug inválido → 404
- [x] Mesmo shape de resposta dos endpoints autenticados (onde aplicável)

---

## PR 10 — Seeds + polish

**Objetivo:** Ambiente de dev completo; docs backend atualizados.

**Depende de:** PRs anteriores conforme escopo do seed

### Seeds

- [x] Times e jogadores
- [x] Partidas GROUP_STAGE com resultados
- [x] Standings recalculados
- [x] Estrutura grupo + mata-mata (`create-competition-structure.ts`)
- [x] (opcional) Resultados KNOCKOUT demonstrando avanço automático

### Polish

- [x] Revisar `constants/error-message.ts` — códigos e mensagens do domínio de competição
- [x] Revisar códigos HTTP (400, 404, 409, 422)
- [ ] Atualizar [architecture-backend.md](./architecture-backend.md) — novos domínios, rotas, services
- [ ] (opcional) Testes unitários: `calculate-group-stage-rounds`, `calculate-knockout-rounds`, `standings-calculator`, `advance-winner-in-bracket`

### DoD PR10

- [x] `npm run db:seed` popula cenário demonstrável end-to-end
- [x] Scalar (`/docs`) documenta todos os endpoints novos

---

## Referência rápida — endpoints pendentes

| Método | Rota | PR |
| --- | --- | --- |
| POST | `/championships/:id/stages/setup` | 2 |
| POST | `/championships/:id/stages` | 2 |
| GET | `/championships/:id/stages` | 2 |
| GET | `/championships/:id/structure` | 2 |
| POST/GET | `/championships/:id/stages/:stageId/groups` | 2 |
| POST/GET | `/championships/:id/stages/:stageId/rounds` | 2 |
| POST/GET/PUT | `/championships/:id/matches` | 3 |
| POST | `/championships/:id/matches/:matchId/result` | 4 |
| GET | `/championships/:id/standings` | 4 |
| POST | `/championships/:id/matches/:matchId/events/*` | 6 |
| POST | `/championships/:id/matches/:matchId/mvp` | 6 |
| GET/POST | `/championships/:id/awards` | 8 |
| GET | `/public/championships/:slug/structure` | 9 |
| GET | `/public/championships/:slug/standings` | 9 |
| GET | `/public/championships/:slug/matches` | 9 |

---

## Fora do escopo v1 (backend)

- Bracket SVG ou layout visual (responsabilidade do frontend)
- Drag-and-drop / reorder de fases ou rodadas via API
- Geração automática de confrontos round-robin (fixtures) — apenas rodadas são geradas no setup; partidas GROUP_STAGE criadas manualmente ou em evolução futura
