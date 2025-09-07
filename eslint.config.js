import js from '@eslint/js';
import globals from 'globals';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['packages/**/*.ts', 'packages/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './packages/api/tsconfig.json', './packages/db/tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
      'no-unused-vars': 'off', // Disabled for TypeScript files, handled by TypeScript itself
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Re-enable for TS, allow unused args with '_' prefix
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.d.ts',
      'migrations/',
      '.env*',
      'eslint.config.js',
    ],
  },
];