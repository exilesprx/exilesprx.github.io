import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import prettierEslint from 'eslint-config-prettier';
import astroPlugin from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';

export default [
  ...astroPlugin.configs.recommended,
  {
    ignores: [
      'dist/**',
      'public/**',
      'node_modules/**',
      '.pnpm-store/**',
      '.astro/**',
      '**/.astro/**',
      '**/.prettierrc.ts'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
        globals: { ...globals.browser, ...globals.node }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      ...tseslint.configs.recommended.reduce(
        (acc, cfg) => ({ ...acc, ...cfg.rules }),
        {}
      ),
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      'prefer-const': 'warn',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ]
    }
  },

  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro']
      },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      astro: astroPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      ...astroPlugin.configs.recommended.reduce(
        (acc, cfg) => ({ ...acc, ...cfg.rules }),
        {}
      ),
      'unused-imports/no-unused-imports': 'error'
    }
  },
  prettierEslint
];
