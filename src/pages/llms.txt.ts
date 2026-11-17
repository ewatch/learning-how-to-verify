import type { APIRoute } from 'astro';
import { PRACTICES } from '../data/practices';
import { LAYERS } from '../data/taxonomy';
import { GUIDES } from '../data/guides';
import { LANGS } from '../data/taxonomy';
import { SITE_URL } from '../lib/site';

export const GET: APIRoute = () => {
  const out = [
    '# Learning how to verify',
    '',
    '> How to verify software, especially when AI coding agents write it. 56 practices ordered along a funnel from cheap, automatic checks (codebase design, types, lint, tests) to expensive ones (formal verification, production practices, human review), with open-source tools per programming language, evidence ratings with sources, and ready-to-paste agent tasks. Available in English (/en/) and German (/de/).',
    '',
    'Every page has a Markdown version: append `index.md` to its URL. Each practice page contains: a short introduction with a concrete problem, a one-sentence definition, the bug class it catches, funnel layer and lifecycle phase, when it is worth it, limits, what changes when agents write the code, evidence (general / AI-specific), tools per language, example code, setup steps and a definition of done.',
    '',
    `Full text of all English practices in one file: ${SITE_URL}/llms-full.txt (German: ${SITE_URL}/llms-full-de.txt)`,
    '',
    '## Overview pages',
    `- [Home: the funnel with all practices](${SITE_URL}/en/index.md)`,
    `- [Lifecycle map](${SITE_URL}/en/lifecycle/index.md): practices by phase, from pre-production to post-release`,
    `- [Glossary](${SITE_URL}/en/glossary/index.md): definitions of the terms used`,
    `- [Getting-started guides](${SITE_URL}/en/guides/index.md)`,
    `- [Tools by language](${SITE_URL}/en/stack/index.md)`,
    `- [The petstore example](${SITE_URL}/en/petstore/index.md): the running example in one place (data, operations, rules such as "a pet must never be reserved twice", system parts) and the practices that check each part`,
    `- [About, sources and self-verification](${SITE_URL}/en/about/index.md)`,
    `- [References](${SITE_URL}/en/references/index.md): talks and articles from practice that this site builds on (not evidence; the evidence ratings use the studies on the About page)`,
    '',
    '## Start',
    `- [Getting Started](${SITE_URL}/en/start/index.md): a guided tour in eight steps on the shared petstore example (a pet must never be reserved twice), about 60–90 minutes`,
    `- [Diagnose my project](${SITE_URL}/en/diagnose/index.md): choose a first check for your own project, try an exercise and copy a feedback-loop task for your agent`,
    `- [Why one layer is not enough with agents](${SITE_URL}/en/why-layers/index.md): research on green tests vs. correct code`,
    ...GUIDES.map((g) => `- [${g.title.en}](${SITE_URL}/en/guides/${g.id}/index.md)`),
    '',
    '## Tools by language',
    ...LANGS.map((lg) => `- [${lg.name}](${SITE_URL}/en/stack/${lg.id}/index.md)`),
    '',
  ];
  for (const layer of LAYERS) {
    out.push(`## Practices: ${layer.name.en} (${layer.examples.en})`);
    for (const p of PRACTICES.filter((x) => x.layer === layer.id)) out.push(`- [${p.name.en}](${SITE_URL}/en/practices/${p.id}/index.md): ${p.oneLiner.en}`);
    out.push('');
  }
  out.push('## Optional', `- [German version](${SITE_URL}/de/)`, `- [Sources and self-verification](${SITE_URL}/en/about/index.md)`);
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
