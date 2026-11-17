import type { APIRoute, GetStaticPaths } from 'astro';
import { PRACTICES } from '../../../data/practices';
import { LAYERS } from '../../../data/taxonomy';
import { practiceMarkdown } from '../../../lib/markdown';

/** One file per funnel layer and language, so an agent can load a slice instead of the whole site. */
export const getStaticPaths: GetStaticPaths = () =>
  (['en', 'de'] as const).flatMap((lang) => LAYERS.map((layer) => ({ params: { lang, layer: layer.id }, props: { lang, layer } })));

export const GET: APIRoute = ({ props }) => {
  const { lang, layer } = props as { lang: 'en' | 'de'; layer: (typeof LAYERS)[number] };
  const body = PRACTICES.filter((p) => p.layer === layer.id).map((p) => practiceMarkdown(p, lang));
  const title = lang === 'en' ? `# Learning how to verify: ${layer.name.en} practices` : `# Verifizieren lernen: Praktiken (${layer.name.de})`;
  return new Response([title, ...body].join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
