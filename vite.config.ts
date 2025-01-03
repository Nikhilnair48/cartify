import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['aws-sdk'],
    },
  },
  resolve: {
    alias: {
      '@handlers': '/src/handlers',
      '@models': '/src/models',
      '@utils': '/src/utils',
      '@services': '/src/services',
    },
    extensions: ['.ts', '.js'],
  },
});