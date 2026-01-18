import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { existsSync } from 'fs';

// Resolve shared package - prefer dist (for production builds), fallback to source (for dev)
// The prebuild script ensures dist exists before vite build runs
const sharedDistPath = path.resolve(__dirname, '../shared/dist');
const sharedSrcPath = path.resolve(__dirname, '../shared/src');
const sharedPath = existsSync(sharedDistPath) ? sharedDistPath : sharedSrcPath;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // For production builds, always use dist (prebuild ensures it exists)
  // For dev, use source so Vite can process TypeScript directly
  const resolveShared = command === 'build' && existsSync(sharedDistPath)
    ? sharedDistPath
    : sharedSrcPath;

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': sharedSrcPath,
        '@abra-shift-master/shared': resolveShared,
      },
    },
    optimizeDeps: {
      include: ['@abra-shift-master/shared'],
    },
  };
});
