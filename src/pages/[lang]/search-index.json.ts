import type { APIRoute } from 'astro';
import type { Locale } from '../../data/types';
import { langPaths } from '../../lib/paths';
import { buildSearchIndex } from '../../lib/search-index';

export const getStaticPaths = langPaths;

export const GET: APIRoute = ({ props }) => {
  const { lang } = props as { lang: Locale };
  const docs = buildSearchIndex(lang);
  return new Response(JSON.stringify(docs), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
