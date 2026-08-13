import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // See tests/support/server-only-stub.ts.
      'server-only': path.resolve(__dirname, 'tests/support/server-only-stub.ts'),
    },
  },
})
