import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bebop-valuation/',
  server: { port: 4173 },
  plugins: [{
    name: 'copy-runtime-json',
    writeBundle() {
      cpSync(resolve('config.json'), resolve('dist/config.json'));
      cpSync(resolve('data'), resolve('dist/data'), { recursive: true });
    }
  }]
});
