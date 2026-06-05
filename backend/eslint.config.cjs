const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const stylistic = require('@stylistic/eslint-plugin');
const tseslint = require('typescript-eslint');

module.exports = defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'build/**',
      'dist/**',
      'generated/**',
      'node_modules/**',
      'eslint.config.cjs',
      'prettier.config.cjs',
    ],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Prettier só no "npm run format" — no save não remove linhas em branco intencionais
      'prettier/prettier': 'off',

      // No save: corrige indentação
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],

      // Até 1 linha em branco seguida
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],
    },
  },
);
