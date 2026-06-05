# Arquitetura Backend — Copa Manager API

Este documento descreve como o projeto está organizado, como criar uma nova rota e como os erros são tratados.

## Visão geral

API REST construída com **Node.js**, **Fastify 5** e **TypeScript**, seguindo uma arquitetura em camadas inspirada em Clean Architecture:

| Camada | Responsabilidade |
|--------|------------------|
| **HTTP** (rotas, controllers, schemas) | Receber requisições, validar entrada/saída, autenticar e responder |
| **Use Cases** | Regras de negócio e orquestração de dados |
| **Repositories** | Contratos de acesso a dados (interfaces) |
| **Prisma Repositories** | Implementações de persistência com Prisma |
| **Services / Lib** | Lógica auxiliar reutilizável, Prisma client, Zod, etc. |

**Stack principal:** Fastify, Zod (`fastify-type-provider-zod`), Prisma, JWT Bearer, Scalar (Swagger), ESLint + Prettier.

Todas as rotas da API ficam sob o prefixo `/api/v1`. A documentação interativa fica em `/docs` (quando `ENABLE_SWAGGER=true`).

---

## Estrutura de pastas

```text
backend/
├── src/
│   ├── server.ts              # Ponto de entrada — sobe o servidor
│   ├── app.ts                 # Configuração do Fastify, plugins e registro de rotas
│   ├── config/                # CORS, JWT, Swagger, error handler, env
│   ├── constants/             # Constantes globais (erros, paginação, etc.)
│   ├── http/
│   │   ├── routes/            # Agrupamento de rotas por domínio
│   │   ├── controllers/       # Handlers HTTP (fino — só orquestra)
│   │   ├── schemas/           # Schemas Zod (validação + documentação OpenAPI)
│   │   ├── middlewares/       # Auth e middlewares HTTP
│   │   └── plugins/           # Plugins Fastify customizados (se necessário)
│   ├── use-cases/             # Lógica de negócio por domínio
│   ├── repositories/          # Interfaces de repositório
│   ├── prisma/
│   │   └── repositories/      # Implementações Prisma dos repositórios
│   ├── services/              # Serviços auxiliares (token, standings, etc.)
│   ├── lib/                   # Clientes externos (prisma, zod, configs de bibliotecas…)
│   ├── utils/                 # Helpers (logger, erros, validações, funções reutilizaveis…)
│   └── @types/                # Extensões de tipos (FastifyRequest, JWT…)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
├── docker/
├── docker-compose.yml
└── package.json
```

---

## Fluxo de uma requisição

```text
Cliente HTTP
    │
    ▼
Fastify (app.ts)
    │  plugins: CORS, JWT, Swagger (opcional)…
    │  errorHandler global (validação/serialização)
    ▼
Rota (ex: auth.routes.ts)
    │  middleware auth (se necessário)
    │  schema Zod (body, params, query, response)
    ▼
Controller (ex: register.controller.ts)
    │  instancia Use Case e chama execute()
    │  try/catch + formatError()
    ▼
Use Case (ex: register.ts)
    │  regras de negócio
    │  throw errorMessage.xxx quando falha
    ▼
Repository (interface)
    ▼
Prisma Repository → Prisma Client → PostgreSQL
```

**Fluxo único obrigatório:**

```text
Controller → Use Case → Repository → Prisma
```

❌ Proibido usar Prisma fora de `prisma/repositories/`.

---

## Como criar uma nova rota

O padrão do projeto é **1 rota = schema + controller + use case + repository (se persistir dados)**.

### Passo 1 — Schema (`src/http/schemas/<domínio>/<ação>.schema.ts`)

Define validação de entrada, formato de resposta e metadados do Swagger.

`common.schema.ts` contém **apenas** o `errorSchema e futuramente o paginationSchema quando precisar` compartilhado. Schemas de resposta de sucesso ficam no arquivo de cada rota.

```ts
import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'

const championshipResponseSchema = z.object({
  data: z.object({ /* ... */ }),
})

export const getChampionshipSchema = {
  tags: ['Championships'],
  summary: 'Buscar campeonato',
  operationId: 'getChampionship',
  security: [{ bearerAuth: [] }],
  params: z.object({
    championshipId: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: championshipResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type GetChampionshipParams = z.infer<typeof getChampionshipSchema.params>
```

**Convenções:**

- Use `expandErrorResponses` com `'4xx'` e `'5xx'` para documentar erros no Swagger.
- Exporte tipos com `z.infer` para usar no controller (`as GetChampionshipParams`, `as CreateChampionshipBody`, etc.).
- **Não** coloque schemas de resposta de sucesso em `common.schema.ts` — apenas erros.
- Mensagens de validação Zod estão em português (`src/lib/zod.ts`).
- Respostas de sucesso seguem `{ data: ... }` conforme `api-spec.md`.

### Passo 2 — Repository (se necessário)

Interface em `src/repositories/<entidade>-repository.ts`.

Implementação em `src/prisma/repositories/prisma-<entidade>-repository.ts`.

Repositories contêm apenas CRUD e queries — **sem regra de negócio**.

### Passo 3 — Use Case (`src/use-cases/<domínio>/<ação>.ts`)

Contém a lógica de negócio. Não conhece HTTP.

```ts
import { errorMessage } from '@/constants/error-message'
import type { ChampionshipRepository } from '@/repositories/championship-repository'

export class GetChampionshipUseCase {
  constructor(private readonly championshipRepository: ChampionshipRepository) {}

  async execute({ championshipId }: { championshipId: string }) {
    const championship = await this.championshipRepository.findById(championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    return { championship }
  }
}
```

**Convenções:**

- Classe com método `execute()`.
- Interfaces tipadas para request/response do use case.
- Erros de negócio são lançados com `throw errorMessage.<nomeDoErro>`.
- Use cases **não** recebem `FastifyInstance` nem conhecem Fastify.

### Passo 4 — Controller (`src/http/controllers/<domínio>/<ação>.controller.ts`)

Camada fina: extrai dados da request, chama o use case e devolve a resposta.

```ts
import type { FastifyReply, FastifyRequest } from 'fastify'

import type { GetChampionshipParams } from '@/http/schemas/championships/get-championship.schema'
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository'
import { GetChampionshipUseCase } from '@/use-cases/championships/get-championship'
import { formatError } from '@/utils/errors/format-error'
import { logger } from '@/utils/logger'

export async function getChampionshipController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { championshipId } = request.params as GetChampionshipParams

  try {
    const getChampionshipUseCase = new GetChampionshipUseCase(new PrismaChampionshipRepository())

    const { championship } = await getChampionshipUseCase.execute({ championshipId })

    return reply.status(200).send({ data: { championship } })
  } catch (err) {
    logger.error('Get championship error', err)
    const { statusCode, code, message } = formatError(err)

    return reply.status(statusCode).send({ code, message })
  }
}
```

**Convenções:**

- Use `FastifyRequest` e `FastifyReply` sem generics; faça cast de `body`, `params` ou `query` com os tipos exportados do schema.
- Rotas autenticadas usam `onRequest: [app.authenticate]` ou middleware equivalente.
- Sempre envolva a lógica em `try/catch` com `formatError()`.
- Status HTTP coerente: `201` para criação, `200` para leitura/atualização, `204` quando não há body.

### Passo 5 — Arquivo de rotas (`src/http/routes/<domínio>.routes.ts`)

Agrupa endpoints de um mesmo domínio.

```ts
import type { FastifyInstance } from 'fastify'
import { getChampionshipController } from '@/http/controllers/championships/get-championship.controller'
import { getChampionshipSchema } from '@/http/schemas/championships/get-championship.schema'

export async function championshipRoutes(app: FastifyInstance) {
  app.get(
    '/championships/:championshipId',
    { schema: getChampionshipSchema, onRequest: [app.authenticate] },
    getChampionshipController,
  )
}
```

**Rotas públicas** (sem autenticação) não registram middleware de auth. Exemplo: rotas de auth em `auth.routes.ts`.

### Passo 6 — Registrar no `app.ts`

Importe e registre o arquivo de rotas dentro do bloco com prefixo `/api/v1`:

```ts
import { championshipRoutes } from '@/http/routes/championship.routes'

await app.register(championshipRoutes, { prefix: '/api/v1' })
```

### Passo 7 — Erro de negócio (se necessário)

Adicione o erro em `src/constants/error-message.ts`:

```ts
championshipNotFound: {
  code: 'CHAMPIONSHIP/NOT_FOUND',
  message: 'Championship not found',
  statusCode: 404,
},
```

**Padrão de código:** `DOMÍNIO/NOME_DO_ERRO` (ex: `AUTH/INVALID_CREDENTIALS`, `CHAMPIONSHIP/NOT_FOUND`).

### Checklist rápido

- [ ] Schema com body/params/query + response + tipos exportados
- [ ] Repository interface + implementação Prisma (se envolver banco)
- [ ] Use case com `execute()` e erros via `errorMessage`
- [ ] Controller com `try/catch`, `formatError` e auth quando necessário
- [ ] Arquivo `.routes.ts` ligando schema → controller
- [ ] Registro em `app.ts`
- [ ] Erro novo em `error-message.ts` (se aplicável)
- [ ] Modelo Prisma / migration (se envolver banco novo)

---

## Autenticação

O sistema utiliza:

- **JWT** (Access Token) via header `Authorization: Bearer <token>`
- **Refresh Token** persistido no banco (hash SHA-256)
- Login local (email + senha com bcrypt)
- Login Google OAuth (futuro)

O decorator `authenticate` (`src/config/jwt.config.ts`) valida o JWT nas rotas protegidas:

```ts
app.get('/me', { onRequest: [app.authenticate], schema: getProfileSchema }, getProfileController)
```

---

## Tratamento de erros

O projeto trata erros em **três níveis**:

### 1. Erros de validação e serialização (global)

Configurado em `src/config/error.config.ts` e registrado em `app.ts` com `app.setErrorHandler(errorHandler)`.

| Tipo | Quando ocorre | Resposta |
|------|---------------|----------|
| Validação Zod | Body/params/query inválidos | `400` — `{ code, message }` |
| Serialização | Resposta não bate com o schema Zod | `500` — `{ code: 'RESPONSE/SERIALIZATION_ERROR', message }` |
| Erro não tratado | Exceção fora do try/catch do controller | `500` — `{ code: 'RESPONSE/INTERNAL_SERVER_ERROR', message }` |

Códigos definidos em `src/constants/error-message.ts`.

### 2. Erros de negócio (use cases)

Use cases lançam objetos padronizados de `errorMessage`:

```ts
if (!existingUser) {
  throw errorMessage.invalidCredentials
}
```

Cada erro tem `{ code, message, statusCode }`. A API responde:

```json
{
  "code": "AUTH/INVALID_CREDENTIALS",
  "message": "Invalid credentials"
}
```

### 3. Erros nos controllers (`formatError`)

Controllers capturam qualquer exceção e normalizam a resposta:

```ts
try {
  // ...
} catch (err) {
  logger.error('Login error', err)
  const { statusCode, code, message } = formatError(err)

  return reply.status(statusCode).send({ code, message })
}
```

`formatError` (`src/utils/errors/format-error.ts`):

- Se o erro já tem `code`, `message` e `statusCode` → repassa `{ statusCode, code, message }`.
- Caso contrário → retorna `internalServerError` (500).

### Formato padrão de erro na API

```json
{
  "code": "AUTH/INVALID_CREDENTIALS",
  "message": "Invalid credentials"
}
```

### Boas práticas

1. **Nunca** retorne detalhes internos de exceção ao cliente — use `errorMessage`.
2. **Sempre** use `throw errorMessage.xxx` nos use cases, não `reply.status()` diretamente.
3. **Logue** erros inesperados no controller com `logger.error()`.
4. Ao criar um novo erro, siga o padrão `DOMÍNIO/NOME` e escolha o `statusCode` correto (400, 401, 403, 404, 409…).
5. Documente respostas de erro no schema com `errorSchema` (de `common.schema.ts`) e `expandErrorResponses`.

---

## Padronização de código

O backend utiliza **ESLint + Prettier**. Não utilizar Biome.

```bash
npm run format       # Formatação completa (Prettier)
npm run lint         # Verificação ESLint
npm run lint:fix     # Correções automáticas ESLint
```

---

## Comandos úteis

```bash
npm run dev          # Servidor em modo watch
npm run build        # Build de produção
npm run lint         # Verificação ESLint
npm run format       # Formatação Prettier
npm run db:migrate   # Rodar migrações Prisma
npm run db:generate  # Gerar client Prisma
npm run db:studio    # Interface visual do banco
```

---

## Referências no código

| Conceito | Arquivo |
|----------|---------|
| Bootstrap do app | `src/app.ts` |
| Entrada do servidor | `src/server.ts` |
| Exemplo de rota completa | `src/http/routes/auth.routes.ts` |
| Exemplo de controller | `src/http/controllers/auth/register.controller.ts` |
| Exemplo de use case | `src/use-cases/auth/register.ts` |
| Exemplo de schema | `src/http/schemas/auth/register.schema.ts` |
| Catálogo de erros | `src/constants/error-message.ts` |
| Error handler global | `src/config/error.config.ts` |
| Logger | `src/utils/logger.ts` |
| Prisma client | `src/lib/prisma.ts` |
| JWT / authenticate | `src/config/jwt.config.ts` |

---

## Regras de evolução

Não introduzir sem necessidade explícita:

- NestJS, microservices ou arquiteturas distribuídas
- CQRS, event sourcing
- Redis ou filas obrigatórias

Filosofia: MVP primeiro, simplicidade acima de abstração, código previsível.
