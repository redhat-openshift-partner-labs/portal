import { withNuxt } from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: [
      'layers/tairo/**',
      '.nuxt/**',
      '.output/**',
      'node_modules/**',
      'coverage/**',
      'prisma/migrations/**',
    ],
  },
  {
    rules: {
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
  {
    files: ['server/**/*.ts', 'scripts/**/*.ts', 'prisma/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
)
