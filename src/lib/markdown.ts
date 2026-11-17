import type { Locale, Practice } from '../data/types';
import { LANGS, RATING_LABEL, FEEDBACK_LABEL, COST_LABEL } from '../data/taxonomy';
import { SOURCE_BY_ID } from '../data/sources';
import { PRACTICE_BY_ID } from '../data/practices';
import { IN_USE } from '../data/in-use';
import { TOOL_BY_ID } from '../data/tools';
import type { Guide } from '../data/guides';
import { UI } from '../i18n/ui';
import { agentPrompt, layerName, phaseNames } from './prompts';
import { SITE_URL } from './site';
import { PART_BY_ID, PETSTORE_COPY } from '../data/petstore';

const T = (loc: Locale, k: keyof typeof UI) => UI[k][loc];

function cite(id: string): string {
  const s = SOURCE_BY_ID.get(id)!;
  return `${s.authors}: "${s.title}". ${s.venue} ${s.year}${s.preprint ? ' (preprint)' : ''}. ${s.url}`;
}

/** Full practice page as Markdown, for LLMs and the Socratic prompt. */
export function practiceMarkdown(p: Practice, loc: Locale, opts: { short?: boolean; twin?: boolean } = {}): string {
  const out: string[] = [];
  if (opts.twin) out.push(...practiceFrontmatter(p, loc), '');
  out.push(`# ${p.name[loc]}`, '');
  out.push(p.intro[loc], '');
  out.push(`**${T(loc, 'inOneSentence')}:** ${p.oneLiner[loc]}`, '');
  out.push(`- **${T(loc, 'catches')}:** ${p.catches[loc]}`);
  out.push(`- **${T(loc, 'layer')}:** ${layerName(p, loc)} · **${T(loc, 'phase')}:** ${phaseNames(p, loc).join(', ')}`);
  out.push(`- **${T(loc, 'cost')}:** ${COST_LABEL[p.cost][loc]} · **${T(loc, 'feedback')}:** ${FEEDBACK_LABEL[p.feedback][loc]}`);
  out.push(`- **${PETSTORE_COPY.inPetstore[loc]}:** ${p.domain.parts.map((id) => PART_BY_ID.get(id)!.name[loc]).join(', ')}. ${p.domain.what[loc]} ([${PETSTORE_COPY.open[loc]}](${SITE_URL}/${loc}/petstore/index.md))`, '');
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
  const inUse = IN_USE[p.id] ?? [];
  if (inUse.length) {
    const kind = { adoption: 'useAdoption', case: 'useCase', standard: 'useStandard', guidance: 'useGuidance' } as const;
    out.push(`### ${T(loc, 'evidenceUse')}`, T(loc, 'evidenceUseNote'), '');
    for (const fi of inUse) out.push(`- **${T(loc, kind[fi.kind])}:** ${fi.text[loc]} [${cite(fi.src)}]`);
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
      const extension = s.file?.split('.').pop() ?? '';
      const syntax = ({ json: 'json', toml: 'toml', yml: 'yaml', yaml: 'yaml', ts: 'typescript', js: 'javascript', mjs: 'javascript', md: 'markdown', sh: 'bash', sql: 'sql', py: 'python', txt: 'text' } as Record<string, string>)[extension] ?? (s.lang === 'any' ? '' : s.lang);
      out.push(`**${T(loc, 'example')}${s.file ? ` (${s.file})` : ''}:**`, '');
      if (s.description) out.push(s.description[loc], '');
      out.push('```' + syntax, s.code, '```', '');
      for (const f of s.focus ?? []) {
        const [a, b] = Array.isArray(f.line) ? f.line : [f.line, f.line];
        const label = a === b ? `${loc === 'de' ? 'Zeile' : 'Line'} ${a}` : `${loc === 'de' ? 'Zeilen' : 'Lines'} ${a}–${b}`;
        out.push(`- ${label}: ${f.note[loc]}`);
      }
      if (s.focus?.length) out.push('');
    }
    out.push(loc === 'de' ? '## Vorgehen' : '## How to set it up', ...p.steps.map((s, i) => `${i + 1}. ${s[loc]}`), '');
    out.push(`**${loc === 'de' ? 'Fertig, wenn' : 'Done when'}:** ${p.done[loc]}`, '');
  }
  out.push(`## ${T(loc, 'thinkFirst')}`);
  for (const q of p.think) out.push(`- **${loc === 'de' ? 'F' : 'Q'}:** ${q.q[loc]}`, `  **A:** ${q.a[loc]}`);
  out.push('');
  if (!opts.short && p.related.length) {
    out.push(`## ${T(loc, 'related')}`, ...p.related.map((id) => `- [${PRACTICE_BY_ID.get(id)!.name[loc]}](${SITE_URL}/${loc}/practices/${id}/index.md)`), '');
  }
  if (opts.twin && !opts.short) {
    // four backticks: the task itself contains headings, and may contain fenced code
    out.push(`## ${loc === 'de' ? 'Aufgabe für den Agenten' : 'Agent task'}`, '', loc === 'de'
      ? 'Fertige Aufgabe zum Einfügen in einen Coding-Agenten. Das Werkzeug passend zur Sprache des Projekts aus der Tabelle oben wählen.'
      : "A ready-made task to paste into a coding agent. Pick the tool that fits the project's language from the table above.", '', '````markdown', agentPrompt(p, loc, 'any', true), '````', '');
  }
  return out.join('\n');
}

/** Machine-readable header of a practice twin: lets an agent filter and route without parsing prose. Values are JSON strings, which are valid YAML. */
export function practiceFrontmatter(p: Practice, loc: Locale): string[] {
  const other: Locale = loc === 'en' ? 'de' : 'en';
  const q = (x: string) => JSON.stringify(x);
  const url = (l: Locale) => `${SITE_URL}/${l}/practices/${p.id}/`;
  return [
    '---',
    `id: ${p.id}`,
    `title: ${q(p.name[loc])}`,
    `lang: ${loc}`,
    `canonical: ${url(loc)}`,
    `markdown: ${url(loc)}index.md`,
    `alternate_${other}: ${url(other)}index.md`,
    `layer: ${p.layer}`,
    `phases: [${p.phases.join(', ')}]`,
    `cost: ${COST_LABEL[p.cost].en}`,
    `feedback: ${p.feedback}`,
    `evidence_general: ${p.evidence.general.rating}`,
    `evidence_ai: ${p.evidence.ai.rating}`,
    `related: [${p.related.join(', ')}]`,
    '---',
  ];
}

export function guideMarkdown(g: Guide, loc: Locale): string {
  const out: string[] = [`# ${g.title[loc]}`, '', T(loc, 'guideLede'), '', g.outcome[loc], '', `## ${T(loc, 'install')}`];
  for (const i of g.install) out.push(`- ${i.os[loc]}: \`${i.cmd}\``);
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
