import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://tools.ww93.fun',
      outDir: 'build',
      dynamicRoutes: [
        '/',
        '/event-logger',
        '/hanzi',
        '/pinyin',
        '/md2image',
      ],
    }),
  ],
  build: {
    outDir: 'build',
  },
  assetsInclude: ['**/*.json'],
  resolve: {
    alias: {
      'hanzi-writer-data': '/node_modules/hanzi-writer-data',
    },
  },
})
