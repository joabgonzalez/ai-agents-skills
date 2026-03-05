import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import remarkMdLinks from './src/plugins/remark-md-links.mjs';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  site: 'https://joabgonzalez.github.io',
  base: '/ai-agents-skills/',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [[remarkMdLinks, { base: '/ai-agents-skills/' }]],
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
});
