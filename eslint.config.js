import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import react from 'eslint-plugin-react';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/levels/**',
    ],
  },
  {
    files: ['src/shell/**/*.{js,jsx}', 'src/components/**/*.{js,jsx,ts,tsx}', 'src/lib/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    files: ['src/shell/**/*.{js,jsx,ts,tsx}', 'src/components/**/*.{js,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.flat.recommended.rules,
  },
];
