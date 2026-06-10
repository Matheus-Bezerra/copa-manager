# Database Design

## Visão Geral

O Copa Manager utiliza PostgreSQL como banco de dados relacional.

O sistema suporta múltiplos campeonatos independentes na mesma plataforma.

Todos os identificadores utilizam ULID.

Este documento descreve exclusivamente a persistência dos dados e suas relações.

---

# Convenções

## Identificadores

Todas as entidades utilizam ULID como chave primária.

Exemplo:

```text
01JX4S8Y6VABM4QZW4X2N4W4B1
```

---

## Auditoria

As entidades principais devem possuir:

* created_at
* updated_at

Quando aplicável:

* created_by
* updated_by

---

## Soft Delete

Apenas entidades de identidade (ex.: Users) suportam exclusão lógica.

Campo padrão:

* deleted_at

Campeonatos, equipes e jogadores utilizam exclusão física (hard delete).

---

# Authentication

## Users

Representa usuários autenticados.

### Columns

* id
* name
* email
* password_hash
* google_id
* avatar_url
* status
* created_at
* updated_at
* deleted_at

### Constraints

* email unique
* google_id unique nullable

### Notes

* password_hash pode ser nulo para login exclusivamente Google.
* google_id pode ser nulo para login exclusivamente local.

### Indexes

* email
* google_id
* status

---

## Password Reset Tokens

Tokens para redefinição de senha.

### Columns

* id
* user_id
* code
* expires_at
* used_at
* created_at

### Constraints

* code unique

### Indexes

* user_id
* code

---

## Refresh Tokens

Sessões persistentes de autenticação.

### Columns

* id
* user_id
* token_hash
* expires_at
* last_used_at
* created_at

### Indexes

* user_id
* expires_at

### Notes

* O token real nunca deve ser armazenado.
* Apenas o hash do refresh token deve ser persistido.
* Na rotação de sessão ou logout, o registro do refresh token deve ser **removido** (hard delete), não revogado logicamente.

---

# Championships

## Championships

Representa campeonatos.

### Columns

* id
* owner_user_id
* name
* slug
* description
* regulations
* start_date
* end_date
* status
* created_at
* updated_at

### Constraints

* slug unique

### Notes

* Exclusão física (hard delete).
* O slug é derivado do nome e deve ser único na plataforma.
* Dois campeonatos não podem possuir o mesmo nome (nomes que geram o mesmo slug são considerados duplicados).

### Indexes

* slug
* owner_user_id
* status

---

## Championship Members

Usuários com permissões administrativas.

### Columns

* id
* championship_id
* user_id
* role
* created_at

### Constraints

* unique(championship_id, user_id)

### Indexes

* championship_id
* user_id

---

## Invitations

Convites administrativos.

### Columns

* id
* championship_id
* email
* role
* token
* status
* expires_at
* accepted_at
* created_at

### Constraints

* token unique

### Indexes

* championship_id
* email
* token

---

# Championship Rules

## Championship Rules

Configurações personalizadas do campeonato.

### Columns

* id
* championship_id
* win_points
* draw_points
* penalty_bonus_points
* yellow_cards_for_suspension
* red_card_suspension_games
* created_at
* updated_at

### Constraints

* unique(championship_id)

---

## Tie Breaker Rules

Critérios de desempate.

### Columns

* id
* championship_id
* position
* criterion

### Example

```text
1 - Wins
2 - GoalDifference
3 - GoalsScored
4 - HeadToHead
```

### Indexes

* championship_id

---

# Teams

## Teams

### Columns

* id
* championship_id
* name
* short_name
* logo_url
* primary_color
* secondary_color
* created_at
* updated_at

### Notes

* Exclusão física (hard delete).

### Indexes

* championship_id
* name

---

# Players

## Players

### Columns

* id
* team_id
* name
* shirt_number
* created_at
* updated_at

### Notes

* Exclusão física (hard delete).

### Indexes

* team_id
* name

---

## Player Statistics

Estatísticas consolidadas do jogador.

### Columns

* id
* player_id
* matches_played
* goals
* assists
* yellow_cards
* red_cards
* match_mvps
* created_at
* updated_at

### Constraints

* unique(player_id)

### Indexes

* goals
* match_mvps

---

# Competition Structure

## Stages

Fases do campeonato.

### Columns

* id
* championship_id
* name
* type
* format
* teams_to_advance
* qualified_teams
* third_place_match
* display_order
* created_at

### Indexes

* championship_id
* display_order

### Notes

* `format` é obrigatório quando `type` é `GROUP_STAGE`; nulo em `KNOCKOUT`.
* `teams_to_advance` aplica-se a `GROUP_STAGE`; default `1`; define quantos times por grupo avançam para a fase seguinte.
* `qualified_teams` é obrigatório quando `type` é `KNOCKOUT`; nulo em `GROUP_STAGE`.
* `third_place_match` aplica-se apenas a `KNOCKOUT`; default `false`.
* `display_order`: no setup em lote, informado pelo cliente; na criação individual, atribuído automaticamente pelo backend.

---

## Groups

Grupos dentro de uma fase do tipo GROUP_STAGE.

### Columns

* id
* stage_id
* name
* display_order
* created_at

### Indexes

* stage_id
* display_order

### Notes

* `display_order` é atribuído pelo backend na criação (próximo valor sequencial na fase).
* Não possui coluna de quantidade de times; `teams` no setup em lote é input transitório para geração de rodadas.

---

## Rounds

Rodadas dentro de uma fase.

### Columns

* id
* stage_id
* number
* name
* created_at

### Constraints

* unique(stage_id, number)

### Indexes

* stage_id

### Notes

* `number` é atribuído automaticamente na criação individual (próximo valor sequencial na fase).
* No setup em lote, rodadas são geradas automaticamente com base em `format` (`GROUP_STAGE`) ou `qualifiedTeams` (`KNOCKOUT`).

---

## Matches

Partidas.

### Columns

* id
* championship_id
* round_id
* group_id
* home_team_id
* away_team_id
* scheduled_at
* status
* created_at
* updated_at

### Notes

* group_id é obrigatório quando a fase da rodada é GROUP_STAGE; nulo em fases KNOCKOUT.
* O stage é derivado via round.stage_id.
* Em fases `KNOCKOUT`, partidas podem ser criadas sem times (`home_team_id` / `away_team_id` nulos) como placeholder até avanço automático ou sorteio manual.

### Indexes

* championship_id
* round_id
* group_id
* scheduled_at

---

## Match Bracket Links

Vínculos de avanço entre partidas eliminatórias.

### Columns

* id
* from_match_id
* to_match_id
* outcome
* to_slot
* created_at

### Constraints

* unique(from_match_id, outcome)

### Notes

* `outcome`: `WINNER` ou `LOSER` (ex.: perdedor de semifinal → 3º Lugar).
* `to_slot`: `HOME` ou `AWAY` na partida de destino.
* Criado automaticamente no setup em lote de fases `KNOCKOUT`.
* Ao encerrar `from_match`, o time correspondente preenche o slot em `to_match`.

---

## Match Results

Resultado oficial.

### Columns

* id
* match_id
* home_score
* away_score
* home_penalty_score
* away_penalty_score
* created_at

### Constraints

* unique(match_id)

---

## Match Events

Eventos registrados na partida.

### Columns

* id
* match_id
* player_id
* team_id
* event_type
* minute
* notes
* created_at

### Examples

* Goal
* Yellow Card
* Red Card
* MVP

### Indexes

* match_id
* player_id
* event_type

---

# Rankings

## Standings

Classificação por grupo dentro de uma fase.

### Columns

* id
* championship_id
* stage_id
* group_id
* team_id
* position
* points
* wins
* draws
* losses
* goals_scored
* goals_conceded
* goal_difference
* updated_at

### Constraints

* unique(stage_id, group_id, team_id)

### Notes

* championship_id mantido como denormalização para consultas globais e endpoints públicos.

### Indexes

* championship_id
* stage_id
* group_id
* position

---

# Championship Configuration

## championship_rules

Regras de pontuação do campeonato (uma por campeonato).

### Columns

* id
* championship_id (FK → championships, unique)
* win_points (default 3)
* draw_points (default 1)
* penalty_bonus_points (default 0)
* created_at
* updated_at

### Constraints

* unique(championship_id)

---

## tie_breaker_rules

Critérios de desempate configurados para o campeonato, ordenados por posição.

### Columns

* id
* championship_id (FK → championships)
* criterion (enum: POINTS, WINS, GOAL_DIFFERENCE, GOALS_SCORED, HEAD_TO_HEAD)
* position (Int — ordem de aplicação)
* created_at

### Constraints

* unique(championship_id, position)

### Indexes

* championship_id

---

# Awards

## Awards

Premiações concedidas.

### Columns

* id
* championship_id
* player_id
* award_type
* created_at

### Indexes

* championship_id
* player_id

---

# Enums

## user_status

* ACTIVE
* BLOCKED

---

## championship_status

* OPEN
* IN_PROGRESS
* FINISHED

---

## championship_role

* OWNER
* ADMINISTRATOR
* ORGANIZER

---

## invitation_status

* PENDING
* ACCEPTED
* EXPIRED

---

## stage_type

* GROUP_STAGE
* KNOCKOUT

---

## stage_format

* ROUND_ROBIN
* DOUBLE_ROUND_ROBIN

---

## match_status

* SCHEDULED
* IN_PROGRESS
* FINISHED
* CANCELLED

---

## match_event_type

* GOAL
* YELLOW_CARD
* RED_CARD
* MVP

---

## award_type

* TOP_SCORER
* MATCH_MVP
* TOURNAMENT_MVP
* FAIR_PLAY

---

## bracket_link_outcome

* WINNER
* LOSER

---

## bracket_link_slot

* HOME
* AWAY

---

# Relacionamentos Principais

```text
User
 ├─ Championship (Owner)
 ├─ ChampionshipMember
 ├─ PasswordResetToken
 └─ RefreshToken

Championship
 ├─ ChampionshipRules (1:1 — championship_rules)
 ├─ TieBreakerRules  (1:N — tie_breaker_rules)
 ├─ ChampionshipMembers
 ├─ Invitations
 ├─ Teams
 ├─ Stages
 │   ├─ Groups
 │   └─ Rounds
 ├─ Matches
 ├─ Standings
 └─ Awards

Team
 ├─ Players
 └─ Matches

Player
 ├─ PlayerStatistics
 ├─ MatchEvents
 └─ Awards

Match
 ├─ MatchResult
 ├─ MatchEvents
 └─ MatchBracketLink (from / to)

Round
 └─ Match

Group
 ├─ Standing
 └─ Match
```
