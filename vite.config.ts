import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const handlersDir = './src/handlers';

const handlerEntries = fs
  .readdirSync(resolve(handlersDir))
  .filter((file) => file.endsWith('.ts'))
  .reduce((entries, file) => {
    const name = file.replace('.ts', '');
    entries[name] = resolve(handlersDir, file);
    return entries;
}, {});

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
        input: handlerEntries,
        external: ['aws-sdk'],
        output: {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
          },
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
