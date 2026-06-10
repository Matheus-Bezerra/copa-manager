import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'build/**',
      'dist/**',
      'node_modules/**',
      'src/route-tree.gen.ts',
      'eslint.config.js',
      'prettier.config.cjs',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'prettier/prettier': 'off',
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
