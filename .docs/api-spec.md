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

### Permission

* Owner
* Administrator

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

---

## List Stages

### GET

```http
/championships/{championshipId}/stages
```

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
  "stageId": "",
  "homeTeamId": "",
  "awayTeamId": "",
  "scheduledAt": "2026-06-17T19:00:00Z"
}
```

---

## List Matches

### GET

```http
/championships/{championshipId}/matches
```

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
/championships/{championshipId}/standings
```

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

## Public Standings

### GET

```http
/public/championships/{slug}/standings
```

---

## Public Matches

### GET

```http
/public/championships/{slug}/matches
```

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
| Gerenciar membros     | ✅     | ✅             | ❌         | ❌         |
| Criar equipes         | ✅     | ✅             | ✅         | ❌         |
| Criar jogadores       | ✅     | ✅             | ✅         | ❌         |
| Registrar partidas    | ✅     | ✅             | ✅         | ❌         |
| Registrar eventos     | ✅     | ✅             | ✅         | ❌         |
| Visualizar campeonato | ✅     | ✅             | ✅         | ✅         |
| Excluir campeonato    | ✅     | ❌             | ❌         | ❌         |

```
```
