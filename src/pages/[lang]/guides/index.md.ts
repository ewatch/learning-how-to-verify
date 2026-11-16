import type { APIRoute } from 'astro';
import type { Locale } from '../../../data/types';
import { langPaths } from '../../../lib/paths';
import { guidesIndexMarkdown } from '../../../lib/page-markdown';
export const getStaticPaths = langPaths;
export const GET: APIRoute = ({ params }) => new Response(guidesIndexMarkdown(params.lang as Locale), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
