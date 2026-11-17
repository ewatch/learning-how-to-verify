/** Path prefix of the deployment without a trailing slash: '' at the domain root, '/repo-name' on a GitHub Pages project site. */
export const BASE: string = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
/** Base URL used in prompts, llms.txt and Markdown twins. Set PUBLIC_SITE_URL (origin) and PUBLIC_BASE_PATH at build time. */
export const SITE_URL: string = (import.meta.env.PUBLIC_SITE_URL || 'https://learning-how-to-verify.pages.dev').replace(/\/+$/, '') + BASE;
