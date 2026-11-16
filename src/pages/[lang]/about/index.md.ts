import type { APIRoute } from 'astro';
import type { Locale } from '../../../data/types';
import { langPaths } from '../../../lib/paths';
import { aboutMarkdown } from '../../../lib/page-markdown';
export const getStaticPaths = langPaths;
export const GET: APIRoute = ({ params }) => new Response(aboutMarkdown(params.lang as Locale), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
