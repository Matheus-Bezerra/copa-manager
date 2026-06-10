import { cpSync, existsSync } from 'node:fs';
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
    options.jsx = 'automatic';
  },
  onSuccess: async () => {
    const assetsSrc = path.join(srcDir, 'src/emails/assets');
    const assetsDest = path.join(srcDir, 'build/emails/assets');

    if (existsSync(assetsSrc)) {
      cpSync(assetsSrc, assetsDest, { recursive: true });
    }
  },
});
