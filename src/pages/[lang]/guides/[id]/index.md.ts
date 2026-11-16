import type { APIRoute } from 'astro';
import type { Locale } from '../../../../data/types';
import { GUIDES, GUIDE_BY_ID } from '../../../../data/guides';
import { guideMarkdown } from '../../../../lib/markdown';
export function getStaticPaths() {
  return (['en', 'de'] as Locale[]).flatMap((lang) => GUIDES.map((g) => ({ params: { lang, id: g.id } })));
}
export const GET: APIRoute = ({ params }) =>
  new Response(guideMarkdown(GUIDE_BY_ID.get(params.id!)!, params.lang as Locale), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
