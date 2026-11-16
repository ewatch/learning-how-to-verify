import type { Locale, Practice } from '../data/types';
import { LANGS, RATING_LABEL, FEEDBACK_LABEL, COST_LABEL } from '../data/taxonomy';
import { SOURCE_BY_ID } from '../data/sources';
import { PRACTICE_BY_ID } from '../data/practices';
import { TOOL_BY_ID } from '../data/tools';
import type { Guide } from '../data/guides';
import { UI } from '../i18n/ui';
import { layerName, phaseNames } from './prompts';
import { SITE_URL } from './site';

const T = (loc: Locale, k: keyof typeof UI) => UI[k][loc];

function cite(id: string): string {
  const s = SOURCE_BY_ID.get(id)!;
  return `${s.authors}: "${s.title}". ${s.venue} ${s.year}${s.preprint ? ' (preprint)' : ''}. ${s.url}`;
}

/** Full practice page as Markdown, for LLMs and the Socratic prompt. */
export function practiceMarkdown(p: Practice, loc: Locale, opts: { short?: boolean } = {}): string {
  const out: string[] = [];
  out.push(`# ${p.name[loc]}`, '');
  out.push(`${p.oneLiner[loc]}`, '');
  out.push(`- **${T(loc, 'catches')}:** ${p.catches[loc]}`);
  out.push(`- **${T(loc, 'layer')}:** ${layerName(p, loc)} · **${T(loc, 'phase')}:** ${phaseNames(p, loc).join(', ')}`);
  out.push(`- **${T(loc, 'cost')}:** ${COST_LABEL[p.cost][loc]} · **${T(loc, 'feedback')}:** ${FEEDBACK_LABEL[p.feedback][loc]}`, '');
  out.push(`## ${T(loc, 'worthIt')}`, ...p.worth.map((x) => `- ${x[loc]}`), '');
  out.push(`## ${T(loc, 'limits')}`, ...p.limits.map((x) => `- ${x[loc]}`), '');
  out.push(`## ${T(loc, 'withAgents')}`, p.ai[loc], '');
  if (p.variants?.length) {
    out.push(`## ${T(loc, 'variants')}`, ...p.variants.map((v) => `- **${v.name[loc]}:** ${v.text[loc]}`), '');
  }
  out.push(`## ${T(loc, 'evidence')}`);
  for (const [k, e] of [['evidenceGeneral', p.evidence.general], ['evidenceAi', p.evidence.ai]] as const) {
    out.push(`### ${T(loc, k)}: ${RATING_LABEL[e.rating][loc]}`);
    if (!e.findings.length) out.push(T(loc, 'evidenceNone'));
    for (const fi of e.findings) out.push(`- ${fi.text[loc]} [${cite(fi.src)}]`);
    out.push('');
  }
  if (!opts.short) {
    out.push(`## ${T(loc, 'tools')}`, '');
    out.push(loc === 'de' ? '| Sprache | Werkzeuge |' : '| Language | Tools |', '|---|---|');
    for (const lg of [...LANGS, { id: 'any' as const, name: T(loc, 'anyLanguage') }]) {
      const ids = p.tools[lg.id];
      if (!ids?.length) continue;
      out.push(`| ${lg.name} | ${ids.map((id) => { const t = TOOL_BY_ID.get(id)!; return `[${t.name}](${t.url}) (${t.license})`; }).join(', ')} |`);
    }
    out.push('');
    for (const s of p.snippets ?? []) {
      out.push(`**${T(loc, 'example')}${s.file ? ` (${s.file})` : ''}:**`, '', '```' + (s.lang === 'any' ? '' : s.lang), s.code, '```', '');
    }
    out.push(loc === 'de' ? '## Vorgehen' : '## How to set it up', ...p.steps.map((s, i) => `${i + 1}. ${s[loc]}`), '');
    out.push(`**${loc === 'de' ? 'Fertig, wenn' : 'Done when'}:** ${p.done[loc]}`, '');
  }
  out.push(`## ${T(loc, 'thinkFirst')}`);
  for (const q of p.think) out.push(`- **Q:** ${q.q[loc]}`, `  **A:** ${q.a[loc]}`);
  out.push('');
  if (!opts.short && p.related.length) {
    out.push(`## ${T(loc, 'related')}`, ...p.related.map((id) => `- [${PRACTICE_BY_ID.get(id)!.name[loc]}](${SITE_URL}/${loc}/practices/${id}/index.md)`), '');
  }
  return out.join('\n');
}

export function guideMarkdown(g: Guide, loc: Locale): string {
  const out: string[] = [`# ${g.title[loc]}`, '', g.outcome[loc], '', `## ${T(loc, 'install')}`];
  for (const i of g.install) out.push(`- ${i.os}: \`${i.cmd}\``);
  out.push('', g.installNote[loc], '');
  g.steps.forEach((s, i) => {
    out.push(`## ${i + 1}. ${s.title[loc]}`, '', s.text[loc], '');
    if (s.code) out.push(`\`${s.code.file}\`:`, '', '```', s.code.body.trimEnd(), '```', '');
    if (s.output) out.push(`\`$ ${s.output.cmd}\``, '', '```', s.output.body.trimEnd(), '```', '');
  });
  out.push(`## ${T(loc, 'mistakes')}`, ...g.mistakes.map((m) => `- ${m[loc]}`), '');
  out.push(`## ${T(loc, 'nextSteps')}`, ...g.next.map((n) => `- [${n.label}](${n.url})`), '');
  out.push(`## ${T(loc, 'copyForAgent')}`, ...g.agent.map((a, i) => `${i + 1}. ${a[loc]}`), '');
  out.push(`_${T(loc, 'recordedWith')}: ${g.versions.trim().replace(/\n/g, '; ')}_`);
  return out.join('\n');
}
