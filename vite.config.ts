import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'
import { site } from './src/config/site'

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: site.url,
      outDir: 'build',
      dynamicRoutes: [
        '/',
        '/hanzi',
        '/pinyin',
        '/markdown',
      ],
    }),
    {
      name: 'inject-site-config',
      transformIndexHtml(html) {
        return html
          .replace(/%SITE_NAME%/g, site.name)
          .replace(/%SITE_DESC%/g, site.description)
          .replace(/%SITE_AUTHOR%/g, site.author)
          .replace(/%SITE_KEYWORDS%/g, site.keywords)
          .replace(/%SITE_TITLE%/g, `${site.name} — ${site.tagline}`);
      },
    },
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
