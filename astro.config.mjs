// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://learning-how-to-verify.pages.dev',
  // Sub-path deployments (GitHub Pages project site): PUBLIC_BASE_PATH=/repo-name. Default is the domain root.
  base: process.env.PUBLIC_BASE_PATH || '/',
  trailingSlash: 'ignore',
  // Class-based scoping is smaller than the default :where(.astro-x) selectors. It adds one class of specificity.
  scopedStyleStrategy: 'class',
  build: { format: 'directory' },
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
