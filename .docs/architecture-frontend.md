# Architecture Frontend — Copa Manager

## Visão Geral

O frontend do Copa Manager será construído com **Expo / React Native**.

A padronização de código utiliza **ESLint + Prettier**. Não utilizar Biome.

---

# Stack Oficial

* Expo
* React Native
* TypeScript
* ESLint (lint + correções no save)
* Prettier (formatação via script)

---

# Padronização de Código

## Prettier

Responsável pela formatação completa. Executado via script:

```bash
npm run format
```

Configuração em `prettier.config.cjs`:

```js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindAttributes: ['className'],
};
```

## ESLint

Configuração em `eslint.config.cjs`:

```js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'react/display-name': 'off',

      // Prettier só no "npm run format" — no save ele apaga linha em branco dentro do JSX
      'prettier/prettier': 'off',

      // No save: corrige indentação sem remover linhas em branco
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/jsx-indent-props': ['error', 2],

      // Até 1 linha em branco seguida (organização visual)
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],
    },
  },
]);
```

### Comportamento no save vs format

| Ação | Responsável | O que faz |
| --- | --- | --- |
| Salvar (`Ctrl/Cmd + S`) | ESLint | Corrige indentação, limita linhas em branco |
| `npm run format` | Prettier | Formatação completa (aspas, vírgulas, Tailwind, etc.) |

O `prettier/prettier` fica **off** no ESLint de propósito: no save, o Prettier como regra ESLint removeria linhas em branco dentro de JSX usadas para organização visual.

---

# Editor (`.vscode/`)

* Extensão recomendada: `esbenp.prettier-vscode`
* `formatOnSave`: habilitado via Prettier
* ESLint extension para correções no save

---

# Filosofia

* Formatação pesada via script (`npm run format`), não no save
* Save corrige apenas indentação e excesso de linhas em branco
* Linhas em branco intencionais no JSX são preservadas

---

# Estrutura de Campeonato (v1)

## Fonte de dados

Preferir **`GET /championships/{id}/structure`** (admin) ou **`GET /public/championships/{slug}/structure`** (público) para montar a navegação do campeonato.

Evitar encadear `GET /stages` + `GET /groups` + `GET /rounds` por fase.

Partidas são carregadas separadamente via `GET /matches`, filtrando por `roundId` (e `groupId` quando aplicável).

## Fluxo do organizador

```text
Criar campeonato → Wizard setup (/stages/setup) → Cadastrar times → Agendar partidas por rodada → Registrar resultados
```

### Wizard de setup

Tela multi-step que monta o payload de `POST /stages/setup`:

1. Adicionar fases em sequência (o front define `order` pela posição no array).
2. Por fase `GROUP_STAGE`: nome, formato, lista de grupos (nome + `teams` para preview de rodadas).
3. Por fase `KNOCKOUT`: nome, `qualifiedTeams`, `thirdPlaceMatch`.
4. Preview: quantidade de rodadas que serão geradas antes do submit.

`teams` por grupo é usado só no wizard; após salvar, a UI de classificação reflete times **cadastrados**, não o número informado no setup.

## Telas por fase

Navegação principal: **tabs ou timeline** por fase (`displayOrder`).

### GROUP_STAGE

* Sub-tabs por grupo (quando houver mais de um).
* **Tabela** de classificação: `GET /standings?stageId&groupId`.
* **Rodadas**: lista/accordion por round; partidas da rodada via `GET /matches?roundId=`.

### KNOCKOUT (v1)

Dois níveis de navegação:

1. Timeline do campeonato — fases em sequência pelo `displayOrder`.
2. Dentro da fase — rodadas geradas (`Semifinal`, `Final`, `3º Lugar`, etc.).

Renderização v1: **lista ou cards por rodada** (chave simplificada). Bracket SVG interativo fica fora do escopo v1.

Partidas eliminatórias são preenchidas **automaticamente** conforme resultados (vencedores e perdedores para 3º lugar). Vagas exibem placeholder (ex.: "A definir") até o avanço.

## Criar partida

Seleção em cascata:

```text
Fase → Rodada → (Grupo, se GROUP_STAGE) → Mandante / Visitante / Data
```

Payload: `roundId`, `groupId` (obrigatório em GROUP_STAGE), `homeTeamId`, `awayTeamId`, `scheduledAt`.

Em fases `KNOCKOUT`, partidas da chave podem já existir via setup (placeholder); o organizador agenda e registra resultados — times entram via avanço automático.

## Portal público

Mesma estrutura de tabs por fase (somente leitura), consumindo `/public/.../structure`, `/public/.../standings` e `/public/.../matches`.

## Fora do escopo v1

* Bracket interativo com linhas conectando confrontos.
* Drag-and-drop para reordenar fases ou rodadas.
