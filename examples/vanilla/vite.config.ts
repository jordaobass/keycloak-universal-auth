import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'keycloak-universal-auth': resolve(__dirname, '../../src/index.ts'),
    },
  },
});
