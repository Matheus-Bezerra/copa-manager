import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const srcDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'build',
  clean: true,
  sourcemap: true,
  splitting: false,
  esbuildOptions(options) {
    options.alias = {
      '@': path.join(srcDir, 'src'),
    };
  },
});
