import type { APIRoute } from 'astro';
import type { LangId, Locale } from '../../../../data/types';
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
  const out = [`# ${lg.name}: ${lang === 'en' ? 'verification practices and tools' : 'Verifikationspraktiken und Werkzeuge'}`, ''];
  for (const layer of LAYERS) {
    out.push(`## ${layer.name[lang]}`, '');
    for (const p of PRACTICES.filter((x) => x.layer === layer.id)) {
      const { own, any } = toolsFor(p, prog);
      const tools = [...own, ...any].map((x) => `[${x.name}](${x.url}) (${x.license})`).join(', ') || '—';
      out.push(`- **[${p.name[lang]}](${SITE_URL}/${lang}/practices/${p.id}/index.md)**: ${p.oneLiner[lang]} Tools: ${tools}`);
    }
    out.push('');
  }
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
