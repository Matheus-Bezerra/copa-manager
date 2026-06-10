# Arquitetura Frontend — Template de Projeto

Este documento descreve a arquitetura padrão para iniciar um painel admin em React. Use-o como guia ao criar um projeto do zero — **sem Kubb** (funções de API escritas à mão) e **com ESLint + Prettier** (mesmo padrão do backend).

## Visão geral

SPA construída com **React 19**, **TypeScript** e **Vite 7**, seguindo arquitetura em camadas orientada a features:

| Camada | Responsabilidade |
|--------|------------------|
| **Pages** (rotas) | Telas, layouts, loaders, guards e composição de componentes locais |
| **Components** | UI reutilizável (design system + componentes compartilhados) |
| **HTTP / Hooks** | Funções de requisição + hooks TanStack Query (escritos manualmente) |
| **HTTP / Types** | Tipos TypeScript dos contratos da API |
| **HTTP / Repositories** | Atualizações otimistas de cache após mutations |
| **Stores** | Estado global de UI/sessão (Zustand) |
| **Hooks / Utils / Constants** | Lógica reutilizável, formatação, validação e valores fixos |
| **Lib / Config** | Configuração de bibliotecas (Zod, React Query, env) |

**Stack principal:** React, TanStack Router, TanStack Query, Zustand, Axios, shadcn/ui (Radix + Tailwind CSS 4), React Hook Form + Zod, ESLint + Prettier, Husky + lint-staged.

O frontend consome a API REST do backend via cookies/sessão (`withCredentials: true`) ou Bearer token — conforme o contrato da API. Tipos e hooks são **escritos manualmente**, seguindo o mesmo padrão estrutural que ferramentas de codegen (Kubb, Orval) gerariam.

---

## Estrutura de pastas

```text
frontend/
├── public/
│   └── static/                    # Assets estáticos (logo, imagens…)
├── src/
│   ├── main.tsx                   # Ponto de entrada — monta o React no DOM
│   ├── app.tsx                    # Providers globais + RouterProvider
│   ├── route-tree.gen.ts          # Árvore de rotas gerada pelo TanStack Router (não editar)
│   ├── @types/                    # Tipos globais do projeto
│   ├── assets/                    # Ícones SVG importados como componentes
│   ├── components/
│   │   ├── ui/                    # Design system (shadcn/ui)
│   │   ├── button-loading.tsx     # Componentes utilitários compartilhados
│   │   ├── form-error-message.tsx
│   │   ├── pagination.tsx
│   │   └── …
│   ├── config/
│   │   └── env.ts                 # Validação de variáveis de ambiente (Zod)
│   ├── constants/                 # Constantes por domínio (nav, paginação…)
│   ├── hooks/                     # Hooks customizados (não relacionados à API)
│   ├── http/
│   │   ├── client.ts              # Cliente Axios + interceptors
│   │   ├── types/                 # Tipos dos endpoints, organizados por domínio
│   │   │   ├── api-error.ts       # Tipo padrão de erro da API
│   │   │   └── auth/
│   │   │       └── sign-in-with-password.ts
│   │   ├── hooks/                 # Funções + hooks React Query por domínio
│   │   │   └── auth/
│   │   │       └── use-sign-in-with-password.ts
│   │   ├── repositories/        # Atualização de cache pós-mutation
│   │   │   └── …
│   │   └── index.ts               # Re-export dos hooks públicos
│   ├── lib/
│   │   ├── utils.ts               # cn() — merge de classes Tailwind
│   │   ├── zod.ts                 # Zod com locale PT
│   │   └── react-query.ts         # Instância do QueryClient
│   ├── pages/                     # File-based routing (TanStack Router)
│   │   ├── __root.tsx
│   │   ├── _auth/                 # Layout de autenticação (prefixo _ = pathless)
│   │   │   ├── layout.tsx
│   │   │   └── sign-in/
│   │   └── app/                   # Área autenticada
│   │       ├── layout.tsx
│   │       ├── -components/
│   │       └── <feature>/
│   ├── stores/                    # Zustand (auth, tabela…)
│   ├── styles/
│   │   └── globals.css            # Tailwind 4 + tokens de design
│   └── utils/                     # Helpers (formatters, error-handler…)
├── components.json                # Configuração shadcn/ui
├── eslint.config.js               # ESLint flat config
├── .prettierrc                    # Prettier
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

### Convenções de nomenclatura em `pages/`

| Padrão | Significado | Exemplo |
|--------|-------------|---------|
| `layout.tsx` | Layout compartilhado por rotas filhas | `app/layout.tsx` |
| `index.tsx` | Página da rota | `teams/(teams)/index.tsx` → `/app/teams` |
| `-components/` | Componentes **locais** da rota (prefixo `-` = ignorado pelo router) | `sign-in/-components/sign-in-form.tsx` |
| `$param/` | Segmento dinâmico | `teams/$teamId/index.tsx` → `/app/teams/:teamId` |
| `(grupo)/` | Route group (não aparece na URL) | `(teams)/index.tsx` |

### Convenções em `http/`

| Artefato | Padrão de nome | Exemplo |
|----------|----------------|---------|
| Arquivo de hook | `use-<ação>.ts` | `use-fetch-teams.ts` |
| Função de request | `<ação>` (camelCase) | `fetchTeams`, `createTeam` |
| Query key | `<ação>QueryKey` | `fetchTeamsQueryKey` |
| Mutation key | `<ação>MutationKey` | `createTeamMutationKey` |
| Hook | `use<Ação>` | `useFetchTeams`, `useCreateTeam` |
| Tipos | arquivo por endpoint ou grupo | `types/teams/fetch-teams.ts` |

---

## Fluxo de renderização e dados

```text
main.tsx
    │
    ▼
app.tsx
    │  NuqsAdapter (query strings tipadas)
    │  QueryClientProvider (TanStack Query)
    │  TooltipProvider + Toaster (Sonner)
    │  RouterProvider (contexto: auth + queryClient)
    ▼
__root.tsx
    │  HeadContent + Outlet
    ▼
Layout da área (_auth, app…)
    │  beforeLoad → guards (auth, redirect)
    │  loader → prefetch com ensureQueryData
    │  pendingComponent → SplashPage
    ▼
Página (index.tsx)
    │  useFetchX / useCreateX (hooks manuais)
    │  useQueryStates (filtros na URL via nuqs)
    │  componentes locais em -components/
    ▼
API REST (Axios client.ts)
```

**Fluxo de escrita (mutation):**

```text
Formulário (React Hook Form + Zod)
    │
    ▼
useCreateX / useUpdateX (hook manual)
    │  onSuccess → invalidateQueries ou updateXInCache()
    │  onError → errorHandler() + toast
    ▼
API REST
```

❌ **Evitar** chamar `axios` diretamente nas páginas — use sempre `client` via funções/hooks em `src/http/`.

---

## Integração com API (manual + TanStack Query)

Sem codegen: cada endpoint segue um **pacote previsível** de 4 peças (igual ao que Kubb geraria).

### 1. Tipo de erro padrão (`src/http/types/api-error.ts`)

```ts
export type ApiError = {
  code: string
  message: string
  errors?: { field: string; message: string }[]
}
```

### 2. Tipos do endpoint (`src/http/types/auth/sign-in-with-password.ts`)

```ts
import type { ApiError } from '../api-error'

export type SignInWithPasswordBody = {
  email: string
  password: string
}

export type SignInWithPasswordResponse = {
  token: string
}

export type SignInWithPasswordError = ApiError
```

Para listagens com paginação, alinhe com o backend (`api-spec.md`):

```ts
export type FetchTeamsQueryParams = {
  search?: string
  page?: number
  perPage?: number
}

export type FetchTeamsResponse = {
  teams: Team[]
  pagination: {
    page: number
    perPage: number
    totalCount: number
  }
}
```

### 3. Hook de mutation — exemplo completo

Arquivo: `src/http/hooks/auth/use-sign-in-with-password.ts`

```ts
import type {
  QueryClient,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query'
import { mutationOptions, useMutation } from '@tanstack/react-query'

import type { RequestConfig, ResponseErrorConfig } from '../../client'
import client from '../../client'
import type {
  SignInWithPasswordBody,
  SignInWithPasswordError,
  SignInWithPasswordResponse,
} from '../../types/auth/sign-in-with-password'

export const signInWithPasswordMutationKey = () =>
  [{ url: '/api/v1/sessions/password' }] as const

export type SignInWithPasswordMutationKey = ReturnType<
  typeof signInWithPasswordMutationKey
>

export async function signInWithPassword(
  data: SignInWithPasswordBody,
  config: Partial<RequestConfig<SignInWithPasswordBody>> & {
    client?: typeof client
  } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    SignInWithPasswordResponse,
    ResponseErrorConfig<SignInWithPasswordError>,
    SignInWithPasswordBody
  >({
    method: 'POST',
    url: '/api/v1/sessions/password',
    data,
    ...requestConfig,
  })

  return res.data
}

export function signInWithPasswordMutationOptions(
  config: Partial<RequestConfig<SignInWithPasswordBody>> & {
    client?: typeof client
  } = {},
) {
  const mutationKey = signInWithPasswordMutationKey()

  return mutationOptions<
    SignInWithPasswordResponse,
    ResponseErrorConfig<SignInWithPasswordError>,
    { data: SignInWithPasswordBody },
    typeof mutationKey
  >({
    mutationKey,
    mutationFn: async ({ data }) => signInWithPassword(data, config),
  })
}

export function useSignInWithPassword<TContext>(
  options: {
    mutation?: UseMutationOptions<
      SignInWithPasswordResponse,
      ResponseErrorConfig<SignInWithPasswordError>,
      { data: SignInWithPasswordBody },
      TContext
    > & { client?: QueryClient }
    client?: Partial<RequestConfig<SignInWithPasswordBody>> & {
      client?: typeof client
    }
  } = {},
) {
  const { mutation = {}, client: config = {} } = options ?? {}
  const { client: queryClient, ...mutationOptions } = mutation
  const mutationKey =
    mutationOptions.mutationKey ?? signInWithPasswordMutationKey()

  const baseOptions = signInWithPasswordMutationOptions(config)

  return useMutation(
    { ...baseOptions, mutationKey, ...mutationOptions },
    queryClient,
  ) as UseMutationResult<
    SignInWithPasswordResponse,
    ResponseErrorConfig<SignInWithPasswordError>,
    { data: SignInWithPasswordBody },
    TContext
  >
}
```

### 4. Hook de query — exemplo completo

Arquivo: `src/http/hooks/teams/use-fetch-teams.ts`

```ts
import type {
  QueryClient,
  QueryKey,
  QueryObserverOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'

import type { RequestConfig, ResponseErrorConfig } from '../../client'
import client from '../../client'
import type { ApiError } from '../../types/api-error'
import type {
  FetchTeamsQueryParams,
  FetchTeamsResponse,
} from '../../types/teams/fetch-teams'

export const fetchTeamsQueryKey = (params?: FetchTeamsQueryParams) =>
  [{ url: '/api/v1/teams' }, ...(params ? [params] : [])] as const

export type FetchTeamsQueryKey = ReturnType<typeof fetchTeamsQueryKey>

export async function fetchTeams(
  params?: FetchTeamsQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config

  const res = await request<
    FetchTeamsResponse,
    ResponseErrorConfig<ApiError>,
    unknown
  >({
    method: 'GET',
    url: '/api/v1/teams',
    params,
    ...requestConfig,
  })

  return res.data
}

export function fetchTeamsQueryOptions(
  params?: FetchTeamsQueryParams,
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = fetchTeamsQueryKey(params)

  return queryOptions<
    FetchTeamsResponse,
    ResponseErrorConfig<ApiError>,
    FetchTeamsResponse,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal
      return fetchTeams(params, config)
    },
  })
}

export function useFetchTeams<
  TData = FetchTeamsResponse,
  TQueryData = FetchTeamsResponse,
  TQueryKey extends QueryKey = FetchTeamsQueryKey,
>(
  params?: FetchTeamsQueryParams,
  options: {
    query?: Partial<
      QueryObserverOptions<
        FetchTeamsResponse,
        ResponseErrorConfig<ApiError>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient }
    client?: Partial<RequestConfig> & { client?: typeof client }
  } = {},
) {
  const { query: queryConfig = {}, client: config = {} } = options ?? {}
  const { client: queryClient, ...queryOptions } = queryConfig
  const queryKey = queryOptions?.queryKey ?? fetchTeamsQueryKey(params)

  const query = useQuery(
    {
      ...fetchTeamsQueryOptions(params, config),
      queryKey,
      ...queryOptions,
    } as QueryObserverOptions,
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<ApiError>> & {
    queryKey: TQueryKey
  }

  query.queryKey = queryKey as TQueryKey

  return query
}
```

### Pacote obrigatório por endpoint

| Peça | Query (GET) | Mutation (POST/PUT/PATCH/DELETE) |
|------|-------------|----------------------------------|
| Tipos | `*QueryParams`, `*Response` | `*Body`, `*Response` |
| Key | `fetchXQueryKey(params?)` | `createXMutationKey()` |
| Função pura | `fetchX(params?, config?)` | `createX(data, config?)` |
| Options | `fetchXQueryOptions()` | `createXMutationOptions()` |
| Hook | `useFetchX()` | `useCreateX()` |

### Cliente HTTP (`src/http/client.ts`)

- Base URL: `env.VITE_API_URL`
- `withCredentials: true` (quando a API usa cookie de sessão)
- Interceptor 401 → logout + redirect para `/sign-in`
- `VITE_ENABLE_API_DELAY` — delay artificial para debug (opcional)

### Uso nos componentes

**Query (leitura):**

```tsx
const { data, error, isLoading } = useFetchTeams({ search, page, perPage })

useEffect(() => {
  if (error) {
    const { code, description } = errorHandler(error)
    toast.error(code, { description })
  }
}, [error])
```

**Mutation (escrita):**

```tsx
const { mutateAsync: createTeam, isPending } = useCreateTeam({
  mutation: {
    onSuccess: () => {
      toast.success('Time criado')
      queryClient.invalidateQueries({ queryKey: fetchTeamsQueryKey() })
    },
    onError: (error) => {
      const { code, description } = errorHandler(error)
      toast.error(code, { description })
    },
  },
})
```

**Loader com prefetch:**

```ts
loader: async ({ context: { queryClient } }) => {
  return queryClient.ensureQueryData(fetchTeamsQueryOptions({ page: 1 }))
}
```

### Cache repositories (`src/http/repositories/`)

Funções que atualizam o cache **sem refetch**:

```ts
export function updateTeamInCache(
  queryClient: QueryClient,
  teamId: string,
  partial: Partial<Team>,
) {
  updateCache<FetchTeamsResponse>(queryClient, fetchTeamsQueryKey(), (state) => {
    if (!state) return state
    return {
      ...state,
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, ...partial } : t,
      ),
    }
  })
}
```

---

## Providers e bootstrap

```tsx
<NuqsAdapter>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RouterProvider router={router} context={{ auth: authStore }} />
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  </QueryClientProvider>
</NuqsAdapter>
```

**React Query — defaults** (`src/lib/react-query.ts`):

- `retry: 0`
- `refetchOnWindowFocus: false`
- `staleTime: 60_000` (1 minuto)

---

## Roteamento (TanStack Router)

Rotas definidas por **arquivos** em `src/pages/`, geradas pelo `@tanstack/router-plugin` no Vite.

### Configuração Vite

```ts
tanstackRouter({
  target: 'react',
  autoCodeSplitting: true,
  generatedRouteTree: './src/route-tree.gen.ts',
  routesDirectory: './src/pages',
  routeToken: 'layout',
})
```

### Rota raiz (`__root.tsx`)

```ts
interface RouteContext {
  auth: AuthContext | undefined
  queryClient: QueryClient
  breadcrumb?: string
}
```

### Layout autenticado (`app/layout.tsx`)

```ts
export const Route = createFileRoute('/app')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth?.isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }
  },
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getProfileQueryOptions())
  },
  pendingComponent: SplashPage,
  component: AppLayout,
})
```

### Meta / título

```ts
export const Route = createFileRoute('/_auth/sign-in/')({
  component: SignInPage,
  head: () => ({
    meta: [{ title: 'App - Entrar' }],
  }),
})
```

---

## Autenticação

| Aspecto | Implementação |
|---------|---------------|
| Sessão | Cookie HTTP-only ou Bearer — conforme API |
| Estado local | `useAuthStore` (Zustand + persist) |
| Guard de rotas | `beforeLoad` nos layouts `_auth` e `app` |
| Perfil | Prefetch via `getProfileQueryOptions()` no loader do `/app` |
| Logout | `useAuthStore.logout()` + interceptor 401 no Axios |

```ts
interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  login: () => void
  logout: () => void
}
```

---

## Tratamento de erros

A API responde no formato:

```json
{
  "code": "AUTH/INVALID_CREDENTIALS",
  "message": "Invalid credentials"
}
```

Helper `errorHandler` (`src/utils/error-handler.ts`):

```ts
const { code, description } = errorHandler(error)
toast.error(code, { description })
```

**Boas práticas:**

1. Sempre trate `onError` em mutations com `errorHandler` + `toast.error`.
2. Em queries, use `useEffect` para reagir a `error` ou `throwOnError` no loader.
3. Não exiba mensagens cruas de exceção ao usuário.

---

## Formulários

Padrão: **React Hook Form** + **Zod** (`@hookform/resolvers/zod`).

```tsx
const schema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})

await authenticate({ data: formData })
```

**Convenções:**

- Schemas de formulário ficam na página ou em `-components/`.
- Tipos de request vêm de `src/http/types/`.
- Mensagens Zod em português (`src/lib/zod.ts`).
- `FormErrorMessage` para erros de campo; `ButtonLoading` para submit.

---

## Estado global (Zustand)

| Store | Uso |
|-------|-----|
| `useAuthStore` | Sessão do usuário |
| `useTableStore` | Seleção de linhas em tabelas (bulk actions) |

**Quando usar o quê:**

- **React Query** → dados do servidor.
- **Zustand** → estado de UI compartilhado.
- **nuqs** → filtros e paginação na URL.

---

## UI e Design System

### shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button input table
```

- Style: `new-york`, base `neutral`, CSS variables
- Ícones: Lucide React
- Classes: `cn()` em `@/lib/utils`

### Tailwind CSS 4

- Plugin: `@tailwindcss/vite`
- Tokens: `src/styles/globals.css`

### Componentes: onde colocar

| Local | Quando |
|-------|--------|
| `src/components/ui/` | Design system |
| `src/components/` | Reutilizado em 2+ features |
| `src/pages/.../-components/` | Exclusivo da rota |

---

## Filtros e paginação (nuqs)

```tsx
const [{ search, page, perPage }, setFilters] = useQueryStates({
  search: parseAsString,
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(PER_PAGE_DEFAULT_VALUE),
})

const { data } = useFetchTeams({ search, page, perPage })
```

---

## Como criar uma nova feature

Padrão: **1 feature = tipos + hooks HTTP + rotas + componentes locais**.

### Passo 1 — Tipos (`src/http/types/<domínio>/`)

Crie tipos de request/response alinhados ao backend.

### Passo 2 — Hooks HTTP (`src/http/hooks/<domínio>/`)

Um arquivo por endpoint seguindo o pacote: key → função → options → hook.

### Passo 3 — Export (`src/http/index.ts`)

```ts
export * from './hooks/teams/use-fetch-teams'
export * from './hooks/teams/use-create-team'
```

### Passo 4 — Rotas (`src/pages/app/<feature>/`)

```text
src/pages/app/teams/
├── (teams)/
│   ├── index.tsx
│   └── -components/
├── create/
│   └── index.tsx
└── $teamId/
    └── index.tsx
```

### Passo 5 — Cache repository (opcional)

`src/http/repositories/teams/update-team-in-cache.ts`

### Passo 6 — Menu

Adicione em `src/constants/nav.ts` (tipado com `FileRoutesByTo`).

### Checklist

- [ ] Tipos em `http/types/`
- [ ] Função pura + `*QueryOptions` / `*MutationOptions` + hook
- [ ] Export em `http/index.ts`
- [ ] Rotas em `src/pages/`
- [ ] Listagem com `nuqs` + `Pagination`
- [ ] Formulário com RHF + Zod + `errorHandler`
- [ ] Link no menu

---

## Como criar um novo endpoint HTTP

Checklist por endpoint:

- [ ] `src/http/types/<domínio>/<ação>.ts` — tipos
- [ ] `src/http/hooks/<domínio>/use-<ação>.ts` — implementação
- [ ] Re-export em `src/http/index.ts`
- [ ] (Opcional) `repositories/<domínio>/` se precisar de cache otimista

**Nomenclatura de ações:**

| Operação | Prefixo função/hook |
|----------|---------------------|
| Listar | `fetch` / `useFetch` |
| Buscar um | `get` / `useGet` |
| Criar | `create` / `useCreate` |
| Atualizar | `update` / `useUpdate` |
| Deletar | `delete` / `useDelete` |

---

## Variáveis de ambiente

Validadas com Zod em `src/config/env.ts`:

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API REST |
| `VITE_ENABLE_API_DELAY` | `true` para simular latência (dev) |

```ts
const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_ENABLE_API_DELAY: z
    .string()
    .transform((v) => v === 'true')
    .optional()
    .default('false'),
})

export const env = envSchema.parse(import.meta.env)
```

---

## Configurações de build e tooling

### Vite (`vite.config.ts`)

| Plugin | Função |
|--------|--------|
| `@tanstack/router-plugin` | File-based routing + code splitting |
| `@vitejs/plugin-react` | React Fast Refresh |
| `@tailwindcss/vite` | Tailwind CSS 4 |
| `vite-plugin-svgr` | SVG como componentes React |

**Alias:** `@` → `./src`

### TypeScript

- `strict: true`
- Path alias `@/*` → `./src/*`

### ESLint + Prettier (padrão backend)

O frontend usa **ESLint + Prettier**. Não utilizar Biome.

**Scripts sugeridos (`package.json`):**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build --outDir build",
    "lint": "eslint ./src",
    "lint:fix": "eslint ./src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

**Dependências de dev sugeridas:**

```bash
pnpm add -D eslint prettier eslint-config-prettier \
  @eslint/js typescript-eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh \
  globals
```

**`eslint.config.js` (flat config) — exemplo mínimo:**

```js
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'build', 'src/route-tree.gen.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  prettier,
)
```

**`.prettierrc` — alinhado ao backend:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "arrowParens": "always"
}
```

**`lint-staged`:**

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Git hooks (Husky)

**pre-commit:**

1. `lint-staged` — ESLint + Prettier nos arquivos alterados
2. `pnpm run build` — garante que compila

---

## Padronização de código

```bash
pnpm dev           # Servidor de desenvolvimento
pnpm build         # Build de produção
pnpm lint          # Verificação ESLint
pnpm lint:fix      # Correções automáticas ESLint
pnpm format        # Formatação Prettier
```

**Imports — ordem manual:**

1. Pacotes externos (`react`, `@tanstack/…`)
2. Aliases `@/…`
3. Paths relativos (`./`, `../`)

**Nomenclatura:**

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Páginas/rotas | `kebab-case` | `store-settings/` |
| Componentes | `PascalCase` | `TeamTableRow` |
| Hooks (UI) | `use` + `camelCase` | `useDebounce` |
| Hooks (API) | `use` + `PascalCase` ação | `useFetchTeams` |
| Stores | `use` + nome + `Store` | `useAuthStore` |
| Schemas Zod | `camelCase` + `Schema` | `createTeamSchema` |

---

## Iniciando o projeto do zero

### 1. Scaffold

```bash
pnpm create vite@latest meu-painel --template react-ts
cd meu-painel
pnpm install
```

### 2. Dependências principais

```bash
pnpm add @tanstack/react-router @tanstack/react-query axios zod \
  @hookform/resolvers react-hook-form zustand nuqs sonner \
  clsx tailwind-merge class-variance-authority lucide-react

pnpm add -D @tanstack/router-plugin @vitejs/plugin-react \
  @tailwindcss/vite tailwindcss typescript \
  eslint prettier eslint-config-prettier @eslint/js typescript-eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh globals \
  husky lint-staged vite-plugin-svgr
```

### 3. shadcn/ui + Tailwind

```bash
npx shadcn@latest init
```

### 4. Estrutura base

Crie as pastas: `http/`, `pages/`, `stores/`, `lib/`, `utils/`, `constants/`, `config/`.

Copie/adapte deste repositório de referência (brindefly-panel-admin):

- `src/http/client.ts`
- `src/lib/react-query.ts`, `src/lib/zod.ts`, `src/lib/utils.ts`
- `src/app.tsx`, `src/pages/__root.tsx`
- `src/utils/error-handler.ts`
- `vite.config.ts` (plugins + alias)

### 5. Husky

```bash
pnpm exec husky init
# .husky/pre-commit → npx lint-staged && pnpm run build
```

### 6. Primeiro endpoint

Implemente login manualmente (`use-sign-in-with-password.ts`) e valide o fluxo antes de escalar.

---

## Comandos úteis

```bash
pnpm dev                              # Dev server (porta 5173)
pnpm build                            # Build em /build
pnpm lint                             # ESLint
pnpm lint:fix                         # ESLint com fix
pnpm format                           # Prettier
npx shadcn@latest add <component>     # Componente UI
```

---

## Regras de evolução

1. **Nunca** chamar a API direto nas páginas — use hooks em `src/http/hooks/`.
2. **Sempre** criar o pacote completo: tipos → função → options → hook → export.
3. Componentes de rota em `-components/`; suba para `src/components/` só quando reutilizado.
4. Schemas de formulário podem divergir da API — transforme no `handleSubmit`.
5. Prefira `ensureQueryData` em loaders; `useQuery` na página para dados secundários.
6. Erros via `errorHandler` + `toast` — nunca `alert()`.
7. Query keys estáveis: inclua `params` no array quando a listagem for filtrada.
8. **Não** introduzir Kubb/codegen sem decisão explícita — o padrão manual é intencional.

### Filosofia

MVP primeiro, simplicidade acima de abstração, código previsível. Evitar sem necessidade:

- Redux ou state machines complexas
- Camadas extras (services, use-cases) no frontend
- CSS-in-JS
- Biome no frontend (usar ESLint + Prettier, igual ao backend)
- Codegen obrigatório — tipos manuais alinhados ao `api-spec.md` do backend

---

## Referência de implementação

O projeto **brindefly-panel-admin** (este repositório) serve como referência visual de UI e fluxos, mas usa Kubb + Biome. Ao iniciar um projeto novo:

| Conceito | Onde buscar referência |
|----------|------------------------|
| Padrão de hooks (estrutura) | `src/http/generated/hooks/useFetchCoupons.ts` — replicar manualmente |
| Padrão de mutation | `src/http/generated/hooks/useSignInWithPassword.ts` |
| Cliente HTTP | `src/http/client.ts` |
| Layout autenticado | `src/pages/app/layout.tsx` |
| Formulário de login | `src/pages/_auth/sign-in/-components/sign-in-form.tsx` |
| Listagem com filtros | `src/pages/app/coupons/(coupons)/index.tsx` |
| Cache update | `src/http/repositories/coupons/update-coupon-in-cache.ts` |
| ESLint (backend) | `example.md` → seção "Padronização de código" |
