import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const SUITE_DIRNAME = '.projecthub-grader';
const suiteRoot = dirname(fileURLToPath(import.meta.url));
const studentRoot = resolve(suiteRoot, '..');

export default defineConfig({
  root: studentRoot,
  cacheDir: resolve(suiteRoot, '.vite'),
  plugins: [react()],
  resolve: { alias: { '@student': resolve(studentRoot, 'src') } },
  test: {
    environment: 'jsdom',
    globals: false,
    include: [`${SUITE_DIRNAME}/labs/**/*.test.{js,jsx,mjs,ts,tsx}`],
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    fileParallelism: false,
    passWithNoTests: false,
    watch: false,
  },
});
