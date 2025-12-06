// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://zig-index.github.io',
  output: 'static',
  
  integrations: [
    react(),
    mdx(),
    partytown(),
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/500'),
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        'https://zig-index.github.io/',
        'https://zig-index.github.io/packages',
        'https://zig-index.github.io/applications',
        'https://zig-index.github.io/search',
        'https://zig-index.github.io/how-to-add',
        'https://zig-index.github.io/privacy',
        'https://zig-index.github.io/terms',
      ],
    }),
    markdoc(),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api/github': {
          target: 'https://github.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/github/, ''),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'dexie': ['dexie'],
            'framer': ['framer-motion'],
            'react-query': ['@tanstack/react-query'],
          },
        },
      },
    },
  },
});