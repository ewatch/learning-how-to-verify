import type { APIRoute } from 'astro';
import type { Locale } from '../../../data/types';
import { langPaths } from '../../../lib/paths';
import { diagnoseMarkdown } from '../../../lib/start-markdown';
export const getStaticPaths = langPaths;
export const GET: APIRoute = ({ params }) => new Response(diagnoseMarkdown(params.lang as Locale), {
  headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
});
