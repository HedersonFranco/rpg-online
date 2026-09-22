import js from '@eslint/js'
import globals from 'globals'
import babelParser from '@babel/eslint-parser'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/generated']),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-typescript'],
        },
      },
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      // Babel só faz parsing de tipos, não os enxerga como uso — todo
      // `import type { X } from 'express'` referenciado só em anotação de
      // tipo (ex.: `req: Request`) aparece como não usado. Sem alternativa
      // enquanto não há suporte a TS7 no typescript-eslint (ver CLAUDE.md).
      'no-unused-vars': 'off',
    },
  },
])
