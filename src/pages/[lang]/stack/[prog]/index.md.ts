import type { APIRoute } from 'astro';
import { STACK_COPY } from '../../../../data/page-copy';
import type { LangId, Locale, Practice } from '../../../../data/types';
import { LANGS, LAYERS } from '../../../../data/taxonomy';
import { PRACTICES } from '../../../../data/practices';
import { toolsFor } from '../../../../lib/prompts';
import { SITE_URL } from '../../../../lib/site';
export function getStaticPaths() {
  return (['en', 'de'] as Locale[]).flatMap((lang) => LANGS.map((lg) => ({ params: { lang, prog: lg.id } })));
}
export const GET: APIRoute = ({ params }) => {
  const lang = params.lang as Locale;
  const prog = params.prog! as LangId;
  const lg = LANGS.find((x) => x.id === prog)!;
  const en = lang === 'en';
  const row = (p: Practice) => {
    const { own, any } = toolsFor(p, prog);
    const tools = [...own, ...any].map((x) => `[${x.name}](${x.url}) (${x.license})`).join(', ') || '—';
    return `- **[${p.name[lang]}](${SITE_URL}/${lang}/practices/${p.id}/index.md)**: ${p.oneLiner[lang]} Tools: ${tools}`;
  };
  const out = [`# ${lg.name}: ${en ? 'verification practices and tools' : 'Verifikationspraktiken und Werkzeuge'}`, ''];
  out.push(`## ${en ? 'Start with these' : 'Damit anfangen'}`, '',
    STACK_COPY.coreIntro[lang], '',
    ...PRACTICES.filter((p) => p.core).map(row), '',
    `## ${en ? `All ${PRACTICES.length} practices by layer` : `Alle ${PRACTICES.length} Praktiken nach Schicht`}`, '');
  for (const layer of LAYERS) {
    out.push(`### ${layer.name[lang]}`, '');
    for (const p of PRACTICES.filter((x) => x.layer === layer.id)) out.push(row(p));
    out.push('');
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
