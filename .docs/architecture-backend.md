# Architecture Backend — Copa Manager API

## Visão Geral

O backend do Copa Manager é um monólito modular construído com Node.js e Fastify.

A arquitetura segue o padrão:

```text
HTTP Layer → Use Cases → Repositories → Database (Prisma/PostgreSQL)
```

Não utilizar NestJS, microservices ou arquiteturas distribuídas.

---

# Stack Oficial

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL
* JWT + Refresh Token
* Docker

---

# Princípios Arquiteturais

* Simplicidade acima de abstrações
* Monólito modular
* Separação clara de responsabilidades
* Use Cases como núcleo da regra de negócio
* Repositories como única camada de acesso ao banco
* Fastify como camada HTTP apenas

---

# Estrutura de Pastas

```text
copa-manager-api/
├─ src/
│  ├─ server.ts
│  ├─ app.ts
│
│  ├─ config/
│  ├─ constants/
│  ├─ lib/
│  ├─ utils/
│  ├─ @types/
│
│  ├─ http/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ middlewares/
│  │  ├─ schemas/
│  │  └─ plugins/
│
│  ├─ use-cases/
│  │  ├─ auth/
│  │  ├─ championships/
│  │  ├─ teams/
│  │  ├─ players/
│  │  ├─ matches/
│  │  └─ awards/
│
│  ├─ repositories/
│  │  ├─ user-repository.ts
│  │  ├─ championship-repository.ts
│  │  ├─ team-repository.ts
│  │  ├─ player-repository.ts
│  │  └─ match-repository.ts
│
│  ├─ services/
│  │  ├─ auth/
│  │  ├─ standings/
│  │  ├─ statistics/
│  │  └─ awards/
│
│  ├─ events/
│  ├─ mail/
│
│  └─ prisma/
│     ├─ client.ts
│     ├─ repositories/
│
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  ├─ seeds/
│  └─ constants/
│
├─ docker/
│  ├─ postgres/
│  └─ api/
│
├─ build/
├─ Dockerfile
├─ docker-compose.yml
├─ tsconfig.json
├─ tsup.config.ts
└─ package.json
```

---

# Camadas do Sistema

## 1. HTTP Layer (Fastify)

Responsável apenas por:

* Receber requests
* Validar schemas
* Chamar Use Cases
* Retornar responses

### Contém:

* controllers
* routes
* middlewares
* schemas
* plugins

### Regra:

❌ NÃO contém regra de negócio
❌ NÃO acessa banco
❌ NÃO usa Prisma diretamente

---

## 2. Use Cases (Core do Sistema)

Responsável por toda regra de negócio.

Exemplos:

* Criar campeonato
* Registrar jogador
* Finalizar partida
* Gerar classificação
* Processar eventos de jogo

### Regra:

* Não conhece HTTP
* Não conhece Fastify
* Não acessa Prisma diretamente
* Usa apenas repositories

---

## 3. Repositories (Acesso a Dados)

Responsável por comunicação com o banco.

Exemplos:

* UserRepository
* ChampionshipRepository
* PlayerRepository

### Regra:

* Única camada que acessa Prisma
* Não contém regra de negócio
* Apenas CRUD e queries

---

## 4. Services (Domínio auxiliar)

Responsável por lógica reutilizável não ligada diretamente a um Use Case.

Exemplos:

* cálculo de standings
* cálculo de estatísticas
* regras de awards
* autenticação auxiliar

---

## 5. Prisma Layer

Responsável por:

* conexão com PostgreSQL
* migrations
* seeds
* client singleton

---

# Regras Arquiteturais

## Regra 1 — Fluxo único

```text
Controller → Use Case → Repository → Prisma
```

Nunca inverter fluxo.

---

## Regra 2 — Prisma restrito

❌ Proibido usar Prisma fora de repositories

---

## Regra 3 — Use Cases são o centro

Toda regra de negócio deve estar em Use Cases.

---

## Regra 4 — Controllers são finos

Controllers devem apenas:

* chamar Use Case
* retornar response
* tratar erro HTTP

---

## Regra 5 — Services são auxiliares

Services não podem substituir Use Cases.

---

# Autenticação

O sistema utiliza:

* JWT (Access Token)
* Refresh Token (persistido no banco)
* Login local (email + senha com bcrypt)
* Login Google OAuth

---

# Docker

O ambiente utiliza Docker para:

* PostgreSQL
* API Node.js

Exemplo:

```yaml
services:
  db:
    image: postgres

  api:
    build: .
```

---

# Events System

A pasta `events/` é utilizada para:

* atualizações de estatísticas
* processamento de eventos de partida
* ações pós-registro (MVP, cartões, gols)

---

# Mail System

Responsável por:

* password reset
* convites de campeonato

---

# Regras de Evolução

Não introduzir:

* microservices
* CQRS
* event sourcing
* Redis obrigatório
* filas (Kafka/RabbitMQ)

sem necessidade explícita.

---

# Filosofia do Projeto

* MVP primeiro
* simplicidade acima de abstração
* código previsível
* arquitetura orientada ao domínio
* baixo acoplamento
