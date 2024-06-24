import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    root: './',
    dir: 'src',
  },
  plugins: [tsConfigPaths()],
})
