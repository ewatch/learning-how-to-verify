import type { APIRoute } from 'astro';
import { PRACTICES } from '../data/practices';
import { GUIDES } from '../data/guides';
import { LANGS } from '../data/taxonomy';
import { SITE_URL } from '../lib/site';

const PAGES = ['', 'lifecycle', 'glossary', 'guides', 'stack', 'about', 'petstore', 'start', 'diagnose', 'references', 'why-layers'];
/** Paths of one language, relative to /<lang>/, each with a trailing slash (or empty for the home page). */
export const sitemapPaths = (): string[] => [
  ...PAGES.map((x) => (x ? `${x}/` : '')),
  ...PRACTICES.map((p) => `practices/${p.id}/`),
  ...GUIDES.map((g) => `guides/${g.id}/`),
  ...LANGS.map((l) => `stack/${l.id}/`),
];

/** HTML pages and their Markdown twins, so agents find both. */
export const GET: APIRoute = () => {
  const urls = (['en', 'de'] as const).flatMap((loc) => sitemapPaths().flatMap((p) => [`${SITE_URL}/${loc}/${p}`, `${SITE_URL}/${loc}/${p}index.md`]));
  const body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls.map((u) => `  <url><loc>${u}</loc></url>`), '</urlset>', ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
