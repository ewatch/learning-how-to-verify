import type { APIRoute } from 'astro';
import type { Locale } from '../../../data/types';
import { WHY } from '../../../data/why';
import { SOURCE_BY_ID } from '../../../data/sources';
export const getStaticPaths = () => (['en', 'de'] as Locale[]).map((lang) => ({ params: { lang } }));
export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Locale;
  const out = [`# ${WHY.title[lang]}`, '', WHY.intro[lang], ''];
  WHY.findings.forEach((f, i) => {
    const s = SOURCE_BY_ID.get(f.src)!;
    out.push(`## ${i + 1}. ${f.claim[lang]}`, '', `${f.text[lang]} [${s.authors}: "${s.title}", ${s.venue} ${s.year}${s.preprint ? ', preprint' : ''}. ${s.url}]`, '', `**${lang === 'en' ? 'Which layer catches it' : 'Welche Schicht es fängt'}:** ${f.fix[lang]}`, '');
  });
  out.push(WHY.outro[lang]);
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
