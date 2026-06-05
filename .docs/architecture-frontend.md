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
