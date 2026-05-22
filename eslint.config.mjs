import base from '@teo-garcia/eslint-config-shared/base'
import node from '@teo-garcia/eslint-config-shared/node'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  ...base,
  ...node,
  {
    ignores: [
      '.adonisjs/**',
      'build/**',
      'coverage/**',
      'database/schema.ts',
      'tmp/**',
    ],
  },
  {
    files: ['ace.js', '**/*.config.{js,mjs}', '.lintstagedrc.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])
