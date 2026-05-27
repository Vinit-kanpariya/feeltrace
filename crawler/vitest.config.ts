// crawler/vitest.config.ts
// Crawler-local Vitest configuration — overrides root vitest.config.mts.
// No setupFiles, no jsdom (Node environment only).
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // No setupFiles — crawler tests do not use React or jsdom
  },
})
