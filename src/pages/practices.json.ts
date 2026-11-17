import type { APIRoute } from 'astro';
import { PRACTICES } from '../data/practices';
import { LAYERS, LANGS, PHASES, COST_LABEL } from '../data/taxonomy';
import { TOOL_BY_ID } from '../data/tools';
import { IN_USE } from '../data/in-use';
import { SOURCE_BY_ID } from '../data/sources';
import { SITE_URL } from '../lib/site';

/** Machine-readable index of all practices, so an agent can filter ("cheap, feedback in seconds, tools for Python") without crawling 56 pages. */
export const GET: APIRoute = () => {
  const toolRef = (id: string) => { const t = TOOL_BY_ID.get(id)!; return { id: t.id, name: t.name, url: t.url, license: t.license }; };
  const body = {
    site: SITE_URL,
    layers: LAYERS.map((l) => ({ id: l.id, name: l.name, examples: l.examples })),
    phases: PHASES.map((p) => ({ id: p.id, name: p.name })),
    languages: LANGS.map((l) => ({ id: l.id, name: l.name })),
    practices: PRACTICES.map((p) => ({
      id: p.id,
      name: p.name,
      oneLiner: p.oneLiner,
      catches: p.catches,
      layer: p.layer,
      phases: p.phases,
      core: !!p.core,
      cost: COST_LABEL[p.cost].en,
      feedback: p.feedback,
      evidence: { general: p.evidence.general.rating, ai: p.evidence.ai.rating },
      inUse: (IN_USE[p.id] ?? []).map((f) => ({ kind: f.kind, text: f.text, source: SOURCE_BY_ID.get(f.src)!.url })),
      tools: Object.fromEntries(Object.entries(p.tools).map(([lang, ids]) => [lang, ids!.map(toolRef)])),
      related: p.related,
      url: { en: `${SITE_URL}/en/practices/${p.id}/`, de: `${SITE_URL}/de/practices/${p.id}/` },
      markdown: { en: `${SITE_URL}/en/practices/${p.id}/index.md`, de: `${SITE_URL}/de/practices/${p.id}/index.md` },
    })),
  };
  return new Response(JSON.stringify(body, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
