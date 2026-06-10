# API Specification

## Visão Geral

O Copa Manager expõe uma API REST responsável pela autenticação, gerenciamento de campeonatos, equipes, jogadores, partidas, classificação e premiações.

Todas as rotas são versionadas.

Base URL:

```text
/api/v1
```

---

# Authentication

## Access Token

A autenticação utiliza JWT.

Header obrigatório:

```http
Authorization: Bearer <access-token>
```

---

## Refresh Token

Utilizado para renovação de sessões.

Não concede acesso direto aos recursos da API.

---

# Response Pattern

## Success

```json
{
  "data": {}
}
```

---

## Error

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

# Authentication Endpoints

## Register

### POST

```http
/auth/register
```

### Request

```json
{
  "name": "Matheus",
  "email": "matheus@email.com",
  "password": "12345678"
}
```

### Response

```json
{
  "data": {
    "user": {},
    "accessToken": "",
    "refreshToken": ""
  }
}
```

---

## Login

### POST

```http
/auth/login
```

### Request

```json
{
  "email": "matheus@email.com",
  "password": "12345678"
}
```

### Response

```json
{
  "data": {
    "user": {},
    "accessToken": "",
    "refreshToken": ""
  }
}
```

---

## Google Login

### POST

```http
/auth/google
```

### Request

```json
{
  "credential": "google-token"
}
```

### Response

```json
{
  "data": {
    "user": {},
    "accessToken": "",
    "refreshToken": ""
  }
}
```

---

## Refresh Session

### POST

```http
/auth/refresh
```

### Request

```json
{
  "refreshToken": ""
}
```

### Response

```json
{
  "data": {
    "accessToken": "",
    "refreshToken": ""
  }
}
```

---

## Logout

### POST

```http
/auth/logout
```

### Request

```json
{
  "refreshToken": ""
}
```

### Response

`204 No Content`

---

## Forgot Password

### POST

```http
/auth/forgot-password
```

### Request

```json
{
  "email": "matheus@email.com"
}
```

### Response

`204 No Content`

---

## Reset Password

### POST

```http
/auth/reset-password
```

### Request

```json
{
  "code": "",
  "newPassword": ""
}
```

### Response

`204 No Content`

---

## Change Password

### POST

```http
/auth/change-password
```

### Permission

* Authenticated User

### Request

```json
{
  "currentPassword": "",
  "newPassword": ""
}
```

### Response

`204 No Content`

---

# User Endpoints

## Get Current User

### GET

```http
/me
```

### Response

```json
{
  "data": {
    "id": "",
    "name": "",
    "email": "",
    "avatarUrl": ""
  }
}
```

---

# Championship Endpoints

## Create Championship

### POST

```http
/championships
```

### Permission

* Authenticated User

### Request

```json
{
  "name": "Copa AD Tatuapé",
  "description": "",
  "startDate": "2026-06-01",
  "endDate": "2026-09-16"
}
```

---

## List Championships

### GET

```http
/championships
```

---

## Get Championship

### GET

```http
/championships/{championshipId}
```

---

## Update Championship

### PUT

```http
/championships/{championshipId}
```

### Permission

* Owner
* Administrator

---

## Delete Championship

### DELETE

```http
/championships/{championshipId}
```

### Permission

* Owner

---

# Championship Members

## Invite Member

### POST

```http
/championships/{championshipId}/members/invite
```

### Request

```json
{
  "email": "usuario@email.com",
  "role": "ORGANIZER"
}
```

### Response

```json
{
  "data": {
    "invitation": {
      "id": "01HXYZ...",
      "championshipId": "01HXYZ...",
      "email": "usuario@email.com",
      "role": "ORGANIZER",
      "token": "abc123...",
      "status": "PENDING",
      "expiresAt": "2026-06-13T00:00:00.000Z",
      "acceptedAt": null,
      "createdAt": "2026-06-06T00:00:00.000Z",
      "inviteUrl": "http://localhost:3000/invitations/accept?token=abc123..."
    }
  }
}
```

### Permission

* Owner
* Administrator

---

## Accept Invitation

### POST

```http
/invitations/accept
```

### Request

```json
{
  "token": "invitation-token-from-email"
}
```

### Response

```json
{
  "data": {
    "member": {
      "id": "01HXYZ...",
      "championshipId": "01HXYZ...",
      "userId": "01HXYZ...",
      "role": "ORGANIZER",
      "createdAt": "2026-06-06T00:00:00.000Z",
      "user": {
        "id": "01HXYZ...",
        "name": "Usuario",
        "email": "usuario@email.com",
        "avatarUrl": null
      }
    }
  }
}
```

### Permission

* Authenticated user whose email matches the invitation email

### Notes

* The user must be logged in before accepting the invitation.
* If the user does not have an account, they must register or log in first, then call this endpoint with the invitation token.
* The invitation token is sent by email when a member is invited.

---

## List Members

### GET

```http
/championships/{championshipId}/members
```

---

## Update Member Role

### PATCH

```http
/championships/{championshipId}/members/{memberId}
```

---

## Remove Member

### DELETE

```http
/championships/{championshipId}/members/{memberId}
```

---

# Teams

## Create Team

### POST

```http
/championships/{championshipId}/teams
```

---

## List Teams

### GET

```http
/championships/{championshipId}/teams
```

---

## Update Team

### PUT

```http
/championships/{championshipId}/teams/{teamId}
```

---

## Delete Team

### DELETE

```http
/championships/{championshipId}/teams/{teamId}
```

---

# Players

## Create Player

### POST

```http
/championships/{championshipId}/players
```

### Request

```json
{
  "teamId": "",
  "name": "Matheus",
  "shirtNumber": 10,
  "statistics": {
    "goals": 4,
    "assists": 1,
    "yellowCards": 0,
    "redCards": 0,
    "matchesPlayed": 2
  }
}
```

---

## List Players

### GET

```http
/championships/{championshipId}/players
```

---

## Update Player

### PUT

```http
/championships/{championshipId}/players/{playerId}
```

---

## Delete Player

### DELETE

```http
/championships/{championshipId}/players/{playerId}
```

---

# Stages

## Create Stage

### POST

```http
/championships/{championshipId}/stages
```

### Request

```json
{
  "name": "Pontos Corridos",
  "type": "GROUP_STAGE",
  "format": "ROUND_ROBIN",
  "teamsToAdvance": 2
}
```

Para fase `KNOCKOUT`:

```json
{
  "name": "Mata-Mata",
  "type": "KNOCKOUT",
  "qualifiedTeams": 8,
  "thirdPlaceMatch": false
}
```

### Response

```json
{
  "data": {
    "id": "",
    "name": "Pontos Corridos",
    "type": "GROUP_STAGE",
    "format": "ROUND_ROBIN",
    "teamsToAdvance": 2,
    "qualifiedTeams": null,
    "thirdPlaceMatch": false,
    "displayOrder": 1,
    "createdAt": "2026-06-17T19:00:00Z"
  }
}
```

### Notes

* `type` aceita `GROUP_STAGE` ou `KNOCKOUT`.
* O `name` é livre (ex.: "Oitavas de Final", "Grupos", "Turno e Returno").
* `format` é obrigatório quando `type` é `GROUP_STAGE`; aceita `ROUND_ROBIN` ou `DOUBLE_ROUND_ROBIN`.
* `teamsToAdvance` aplica-se a `GROUP_STAGE` (default `1`); ignorado em `KNOCKOUT`.
* `qualifiedTeams` é obrigatório quando `type` é `KNOCKOUT`; deve ser potência de 2.
* `thirdPlaceMatch` aplica-se apenas a `KNOCKOUT`; default `false`.
* `displayOrder` é atribuído automaticamente pelo backend na criação individual; o cliente não envia esse campo.
* Este endpoint **não** gera rodadas automaticamente; use o setup em lote para isso.

---

## Setup Stages (Bulk)

Cria toda a estrutura de fases, grupos e rodadas em uma única operação.

### POST

```http
/championships/{championshipId}/stages/setup
```

### Request

```json
{
  "stages": [
    {
      "name": "Fase de Grupos",
      "type": "GROUP_STAGE",
      "order": 1,
      "format": "ROUND_ROBIN",
      "teamsToAdvance": 2,
      "groups": [
        { "name": "Grupo A", "teams": 4 },
        { "name": "Grupo B", "teams": 4 }
      ]
    },
    {
      "name": "Mata-Mata",
      "type": "KNOCKOUT",
      "order": 2,
      "qualifiedTeams": 4,
      "thirdPlaceMatch": true
    }
  ]
}
```

### Response

```json
{
  "data": {
    "stages": [
      {
        "id": "",
        "name": "Fase de Grupos",
        "type": "GROUP_STAGE",
        "format": "ROUND_ROBIN",
        "teamsToAdvance": 2,
        "qualifiedTeams": null,
        "thirdPlaceMatch": false,
        "displayOrder": 1,
        "groups": [
          {
            "id": "",
            "name": "Grupo A",
            "displayOrder": 1
          },
          {
            "id": "",
            "name": "Grupo B",
            "displayOrder": 2
          }
        ],
        "rounds": [
          { "id": "", "number": 1, "name": "Rodada 1" },
          { "id": "", "number": 2, "name": "Rodada 2" },
          { "id": "", "number": 3, "name": "Rodada 3" },
          { "id": "", "number": 4, "name": "Rodada 4" },
          { "id": "", "number": 5, "name": "Rodada 5" },
          { "id": "", "number": 6, "name": "Rodada 6" }
        ],
        "createdAt": "2026-06-17T19:00:00Z"
      },
      {
        "id": "",
        "name": "Mata-Mata",
        "type": "KNOCKOUT",
        "format": null,
        "qualifiedTeams": 4,
        "thirdPlaceMatch": true,
        "displayOrder": 2,
        "groups": [],
        "rounds": [
          { "id": "", "number": 1, "name": "Semifinal" },
          { "id": "", "number": 2, "name": "Final" },
          { "id": "", "number": 3, "name": "3º Lugar" }
        ],
        "createdAt": "2026-06-17T19:00:00Z"
      }
    ]
  }
}
```

### Notes

* `order` é informado pelo cliente para cada fase.
* `groups.teams` define a quantidade de times por grupo **apenas no momento do setup**; usado para calcular rodadas em `GROUP_STAGE`. **Não é persistido** — após o setup, a UI reflete os times cadastrados no campeonato.
* A ordem dos grupos segue a posição no array (`displayOrder` 1, 2, 3...).
* **GROUP_STAGE**: rodadas geradas com base em `format` e no maior `teams` entre os grupos.
  * `ROUND_ROBIN` → `(N × (N - 1)) / 2` rodadas, nomeadas "Rodada 1", "Rodada 2", etc.
  * `DOUBLE_ROUND_ROBIN` → `N × (N - 1)` rodadas.
* **KNOCKOUT**: rodadas geradas com base em `qualifiedTeams` e auto-nomeadas (ex.: "Semifinal", "Final"). Se `thirdPlaceMatch: true`, adiciona rodada "3º Lugar" em paralelo à "Final".
* **KNOCKOUT**: também gera **partidas placeholder** da chave e **vínculos de avanço** (`MatchBracketLink`) entre rodadas.
* `teamsToAdvance` em fases `GROUP_STAGE`: quantos times por grupo avançam para a fase `KNOCKOUT` seguinte (default `1`).
* Rodadas podem ser ajustadas manualmente após o setup via endpoints individuais.
* Complementa os endpoints individuais de criação de fase, grupo e rodada.

---

## List Stages

### GET

```http
/championships/{championshipId}/stages
```

### Response

```json
{
  "data": [
    {
      "id": "",
      "name": "Pontos Corridos",
      "type": "GROUP_STAGE",
      "format": "ROUND_ROBIN",
      "teamsToAdvance": 2,
      "qualifiedTeams": null,
      "thirdPlaceMatch": false,
      "displayOrder": 1,
      "createdAt": "2026-06-17T19:00:00Z"
    }
  ]
}
```

### Notes

* Resultados ordenados por `displayOrder` ascendente.

---

## Get Championship Structure

Retorna a estrutura completa do campeonato em uma única resposta: fases, grupos e rodadas aninhados.

### GET

```http
/championships/{championshipId}/structure
```

### Response

```json
{
  "data": {
    "stages": [
      {
        "id": "",
        "name": "Fase de Grupos",
        "type": "GROUP_STAGE",
        "format": "ROUND_ROBIN",
        "qualifiedTeams": null,
        "thirdPlaceMatch": false,
        "displayOrder": 1,
        "groups": [
          {
            "id": "",
            "name": "Grupo A",
            "displayOrder": 1
          }
        ],
        "rounds": [
          {
            "id": "",
            "number": 1,
            "name": "Rodada 1"
          }
        ],
        "createdAt": "2026-06-17T19:00:00Z"
      },
      {
        "id": "",
        "name": "Mata-Mata",
        "type": "KNOCKOUT",
        "format": null,
        "qualifiedTeams": 4,
        "thirdPlaceMatch": true,
        "displayOrder": 2,
        "groups": [],
        "rounds": [
          { "id": "", "number": 1, "name": "Semifinal" },
          { "id": "", "number": 2, "name": "Final" },
          { "id": "", "number": 3, "name": "3º Lugar" }
        ],
        "createdAt": "2026-06-17T19:00:00Z"
      }
    ]
  }
}
```

### Notes

* Fases ordenadas por `displayOrder` ascendente.
* Grupos ordenados por `displayOrder` ascendente dentro de cada fase.
* Rodadas ordenadas por `number` ascendente dentro de cada fase.
* Partidas **não** são incluídas; use `GET /matches` filtrando por `roundId` quando necessário.
* Preferir este endpoint para montar navegação por fases no frontend (admin e autenticado).

---

# Groups

## Create Group

### POST

```http
/championships/{championshipId}/stages/{stageId}/groups
```

### Request

```json
{
  "name": "Grupo A"
}
```

### Response

```json
{
  "data": {
    "id": "",
    "stageId": "",
    "name": "Grupo A",
    "displayOrder": 1,
    "createdAt": "2026-06-17T19:00:00Z"
  }
}
```

### Notes

* A fase deve ser do tipo `GROUP_STAGE`.
* Toda fase `GROUP_STAGE` deve possuir ao menos um grupo.
* `displayOrder` é atribuído automaticamente pelo backend (próximo valor sequencial na fase) e retornado na resposta; o cliente não envia esse campo.

---

## List Groups

### GET

```http
/championships/{championshipId}/stages/{stageId}/groups
```

### Response

```json
{
  "data": [
    {
      "id": "",
      "stageId": "",
      "name": "Grupo A",
      "displayOrder": 1,
      "createdAt": "2026-06-17T19:00:00Z"
    }
  ]
}
```

### Notes

* Resultados ordenados por `displayOrder` ascendente.

---

# Rounds

## Create Round

### POST

```http
/championships/{championshipId}/stages/{stageId}/rounds
```

### Request

```json
{
  "name": "Rodada 1"
}
```

### Response

```json
{
  "data": {
    "id": "",
    "stageId": "",
    "number": 1,
    "name": "Rodada 1",
    "createdAt": "2026-06-17T19:00:00Z"
  }
}
```

### Notes

* `name` é opcional.
* `number` é atribuído automaticamente pelo backend (próximo valor sequencial na fase) e retornado na resposta; o cliente não envia esse campo.

---

## List Rounds

### GET

```http
/championships/{championshipId}/stages/{stageId}/rounds
```

### Response

```json
{
  "data": [
    {
      "id": "",
      "stageId": "",
      "number": 1,
      "name": "Rodada 1",
      "createdAt": "2026-06-17T19:00:00Z"
    }
  ]
}
```

### Notes

* Resultados ordenados por `number` ascendente.

---

# Matches

## Create Match

### POST

```http
/championships/{championshipId}/matches
```

### Request

```json
{
  "roundId": "",
  "groupId": "",
  "homeTeamId": "",
  "awayTeamId": "",
  "scheduledAt": "2026-06-17T19:00:00Z"
}
```

### Notes

* `groupId` é obrigatório quando a fase da rodada é `GROUP_STAGE`; omitido ou nulo em fases `KNOCKOUT`.
* O `stageId` é derivado da rodada informada.

---

## List Matches

### GET

```http
/championships/{championshipId}/matches?roundId={roundId}&groupId={groupId}
```

### Query Parameters

* `roundId` (opcional) — filtra partidas de uma rodada.
* `groupId` (opcional) — filtra partidas de um grupo (aplicável a fases `GROUP_STAGE`).

---

## Get Match

### GET

```http
/championships/{championshipId}/matches/{matchId}
```

---

## Update Match

### PUT

```http
/championships/{championshipId}/matches/{matchId}
```

---

## Register Match Result

### POST

```http
/championships/{championshipId}/matches/{matchId}/result
```

### Request

```json
{
  "homeScore": 2,
  "awayScore": 2,
  "homePenaltyScore": 4,
  "awayPenaltyScore": 3
}
```

### Notes

* Ao encerrar partida de fase `KNOCKOUT`, dispara **avanço automático** do vencedor (e perdedor para 3º Lugar, quando configurado) para a partida vinculada na rodada seguinte.
* Se todas as partidas de uma fase `GROUP_STAGE` estiverem encerradas, dispara **avanço automático** dos classificados para a primeira rodada da fase `KNOCKOUT` seguinte.
* Alteração ou remoção de resultado deve recalcular vagas afetadas em cascata.

---

# Match Events

## Register Goal

### POST

```http
/championships/{championshipId}/matches/{matchId}/events/goal
```

### Request

```json
{
  "playerId": "",
  "minute": 12
}
```

---

## Register Yellow Card

### POST

```http
/championships/{championshipId}/matches/{matchId}/events/yellow-card
```

### Request

```json
{
  "playerId": "",
  "minute": 15
}
```

---

## Register Red Card

### POST

```http
/championships/{championshipId}/matches/{matchId}/events/red-card
```

### Request

```json
{
  "playerId": "",
  "minute": 20
}
```

---

## Define Match MVP

### POST

```http
/championships/{championshipId}/matches/{matchId}/mvp
```

### Request

```json
{
  "playerId": ""
}
```

---

# Standings

## Get Standings

### GET

```http
/championships/{championshipId}/standings?stageId={stageId}&groupId={groupId}
```

### Query Parameters

* `stageId` (obrigatório) — fase da classificação.
* `groupId` (obrigatório) — grupo dentro da fase.

### Response

```json
{
  "data": [
    {
      "teamId": "",
      "position": 1,
      "points": 9,
      "wins": 3,
      "draws": 0,
      "losses": 0,
      "goalsScored": 8,
      "goalsConceded": 2,
      "goalDifference": 6
    }
  ]
}
```

---

# Championship Rules

## Get Championship Rules

Retorna as regras de pontuação do campeonato.

### GET

```http
/championships/{championshipId}/rules
```

### Response

```json
{
  "data": {
    "winPoints": 3,
    "drawPoints": 1,
    "penaltyBonusPoints": 0
  }
}
```

### Notes

* Se o registro ainda não foi configurado, retorna os valores padrão (`winPoints: 3`, `drawPoints: 1`, `penaltyBonusPoints: 0`).

---

## Update Championship Rules

### PUT

```http
/championships/{championshipId}/rules
```

### Request

```json
{
  "winPoints": 3,
  "drawPoints": 1,
  "penaltyBonusPoints": 0
}
```

### Notes

* Todos os campos são opcionais; campos omitidos mantêm o valor atual.
* `winPoints` e `drawPoints` devem ser inteiros ≥ 0.
* Altera pontuações retroativamente apenas ao recalcular standings.

---

## List Tie-Breaker Rules

Retorna os critérios de desempate configurados para o campeonato.

### GET

```http
/championships/{championshipId}/tie-breaker-rules
```

### Response

```json
{
  "data": [
    { "position": 1, "criterion": "POINTS" },
    { "position": 2, "criterion": "WINS" },
    { "position": 3, "criterion": "GOAL_DIFFERENCE" },
    { "position": 4, "criterion": "GOALS_SCORED" }
  ]
}
```

### Notes

* Se não configurado, retorna a lista padrão: `POINTS → WINS → GOAL_DIFFERENCE → GOALS_SCORED`.

---

## Update Tie-Breaker Rules

### PUT

```http
/championships/{championshipId}/tie-breaker-rules
```

### Request

```json
{
  "rules": [
    { "position": 1, "criterion": "POINTS" },
    { "position": 2, "criterion": "HEAD_TO_HEAD" },
    { "position": 3, "criterion": "GOAL_DIFFERENCE" },
    { "position": 4, "criterion": "GOALS_SCORED" }
  ]
}
```

### Notes

* A lista substituí por completo as regras anteriores.
* `position` deve ser único e sequencial a partir de 1.
* `criterion` aceita: `POINTS`, `WINS`, `GOAL_DIFFERENCE`, `GOALS_SCORED`, `HEAD_TO_HEAD`.

---

# Awards

## Get Awards

### GET

```http
/championships/{championshipId}/awards
```

---

## Grant Award

### POST

```http
/championships/{championshipId}/awards
```

### Request

```json
{
  "playerId": "",
  "type": "TOURNAMENT_MVP"
}
```

---

# Public Endpoints

Endpoints disponíveis sem autenticação.

## Public Championship

### GET

```http
/public/championships/{slug}
```

---

## Public Structure

Retorna a estrutura completa do campeonato (fases, grupos e rodadas) para o portal público.

### GET

```http
/public/championships/{slug}/structure
```

### Response

Mesmo formato de `GET /championships/{championshipId}/structure`.

### Notes

* Disponível sem autenticação.
* Partidas não são incluídas; use `GET /public/championships/{slug}/matches` com filtros quando necessário.

---

## Public Standings

### GET

```http
/public/championships/{slug}/standings?stageId={stageId}&groupId={groupId}
```

### Query Parameters

* `stageId` (obrigatório) — fase da classificação.
* `groupId` (obrigatório) — grupo dentro da fase.

---

## Public Matches

### GET

```http
/public/championships/{slug}/matches?roundId={roundId}&groupId={groupId}
```

### Query Parameters

* `roundId` (opcional) — filtra partidas de uma rodada.
* `groupId` (opcional) — filtra partidas de um grupo.

---

## Public Players

### GET

```http
/public/championships/{slug}/players
```

---

# Authorization Matrix

| Recurso               | Owner | Administrator | Organizer | Spectator |
| --------------------- | ----- | ------------- | --------- | --------- |
| Gerenciar campeonato  | ✅     | ✅             | ❌         | ❌         |
| Gerenciar fases       | ✅     | ✅             | ❌         | ❌         |
| Gerenciar membros     | ✅     | ✅             | ❌         | ❌         |
| Criar equipes         | ✅     | ✅             | ✅         | ❌         |
| Criar jogadores       | ✅     | ✅             | ✅         | ❌         |
| Registrar partidas    | ✅     | ✅             | ✅         | ❌         |
| Registrar eventos     | ✅     | ✅             | ✅         | ❌         |
| Visualizar campeonato | ✅     | ✅             | ✅         | ✅         |
| Excluir campeonato    | ✅     | ❌             | ❌         | ❌         |

```
```
