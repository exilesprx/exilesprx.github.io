import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss() as any]
  },

  integrations: [icon()],

  output: 'static',

  site: process.env.SITE_URL || 'https://exilesprx.github.io'
});
