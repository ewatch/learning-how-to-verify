// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://learning-how-to-verify.pages.dev',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
