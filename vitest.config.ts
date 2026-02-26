import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['server/**/*.ts', 'prisma/**/*.ts'],
    },
    // Use separate test database
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
    },
    // Run integration tests sequentially to avoid database conflicts
    sequence: {
      concurrent: false,
    },
  },
})
