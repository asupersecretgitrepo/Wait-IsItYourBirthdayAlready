import { defineConfig } from 'vite';

const secretSlug = 'vault-k9f3b1a2c7d4e8f6a1b2c3d4';

export default defineConfig(({ command }) => ({
  appType: 'mpa',
  base: command === 'build' ? `/${secretSlug}/` : '/',
  build: {
    outDir: 'dist',
    assetsDir: `${secretSlug}/assets`,
    rollupOptions: {
      input: {
        decoy: 'index.html',
        vault: `${secretSlug}/index.html`
      }
    }
  }
}));
