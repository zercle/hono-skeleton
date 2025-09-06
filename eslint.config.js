import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['packages/**/*.ts', 'packages/**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off', // Disabled for TypeScript files
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