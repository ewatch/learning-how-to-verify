import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';

export const GET: APIRoute = () =>
  new Response(['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap.xml`, `# Agent index: ${SITE_URL}/llms.txt`, ''].join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
