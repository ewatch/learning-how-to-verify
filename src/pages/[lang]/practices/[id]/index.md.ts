import type { APIRoute } from 'astro';
import type { Locale } from '../../../../data/types';
import { PRACTICES, PRACTICE_BY_ID } from '../../../../data/practices';
import { practiceMarkdown } from '../../../../lib/markdown';

export function getStaticPaths() {
  return (['en', 'de'] as Locale[]).flatMap((lang) => PRACTICES.map((p) => ({ params: { lang, id: p.id } })));
}
export const GET: APIRoute = ({ params }) =>
  new Response(practiceMarkdown(PRACTICE_BY_ID.get(params.id!)!, params.lang as Locale, { twin: true }), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
