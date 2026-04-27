// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nikek.github.io',
  base: '/color',
  integrations: [svelte(), mdx()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['three', '@threlte/core', '@threlte/extras'],
    },
  },
});
