import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.json'],
  resolve: {
    alias: {
      'hanzi-writer-data': '/node_modules/hanzi-writer-data',
    },
  },
})
