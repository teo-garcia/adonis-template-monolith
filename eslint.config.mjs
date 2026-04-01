import base from '@teo-garcia/eslint-config-shared/base'
import node from '@teo-garcia/eslint-config-shared/node'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  ...base,
  ...node,
  {
    ignores: ['build/**', 'coverage/**', 'tmp/**'],
  },
  {
    files: ['ace.js', '**/*.config.{js,mjs}', '.lintstagedrc.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: [
      'app/**/*.ts',
      'database/migrations/**/*.ts',
      'tests/**/*.ts',
      'bin/**/*.ts',
    ],
    rules: {
      // Adonis conventionally scaffolds snake_case file names for many artifacts.
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['bin/**/*.ts'],
    rules: {
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  {
    files: ['database/migrations/**/*.ts'],
    rules: {
      'unicorn/no-anonymous-default-export': 'off',
    },
  },
])
