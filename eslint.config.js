'use strict'

const importPlugin = require('eslint-plugin-import')
const neostandard = require('neostandard')

module.exports = [
  ...neostandard({
    ts: true,
    ignores: neostandard.resolveIgnoresFromGitignore(),
  }),
  {
    plugins: {
      import: importPlugin
    }
  },
  {
    rules: {
      curly: ['error', 'multi'],
      '@stylistic/space-before-function-paren': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: ['block-like', 'if'],
          next: '*'
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['block-like', 'if']
        },
        {
          blankLine: 'always',
          prev: ['const', 'let'],
          next: ['expression', 'for']
        },
        {
          blankLine: 'always',
          prev: 'expression',
          next: ['const', 'let']
        },
        {
          blankLine: 'always',
          prev: ['multiline-const', 'multiline-let'],
          next: '*'
        },
        {
          blankLine: 'always',
          prev: '*',
          next: ['multiline-const', 'multiline-let']
        },
        {
          blankLine: 'always',
          prev: '*',
          next: 'return'
        }
      ],
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        alphabetize: {
          order: 'asc'
        }
      }],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-void': ['error', { allowAsStatement: true }],
      '@typescript-eslint/consistent-type-imports': 'error'
    }
  },
]
