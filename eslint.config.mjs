import base from '@teo-garcia/eslint-config-shared/base'
import node from '@teo-garcia/eslint-config-shared/node'
import globals from 'globals'

export default [
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
]
