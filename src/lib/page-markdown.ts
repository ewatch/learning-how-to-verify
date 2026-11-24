import type { Locale } from '../data/types';
import { LAYERS, LANGS, PHASES } from '../data/taxonomy';
import { PRACTICES } from '../data/practices';
import { HOME } from '../data/home';
import { ABOUT_COPY, GLOSSARY_COPY, GUIDES_INDEX_COPY, LIFECYCLE_COPY, STACK_COPY } from '../data/page-copy';
import { GLOSSARY } from '../data/glossary';
import { GUIDES } from '../data/guides';
import { SOURCES } from '../data/sources';
import { TOOLS } from '../data/tools';
import { PRACTICE_BY_ID } from '../data/practices';
import { SITE_URL } from './site';
import { t } from '../i18n/ui';
import { PARTS, PART_BY_ID, PETSTORE_COPY, KIND_ORDER } from '../data/petstore';
import { practicesFor } from './petstore';
import { featureOf } from '../data/petstore-features';
import { REFERENCES, REFERENCE_KIND as KIND, REFERENCES_COPY, formatDate } from '../data/references';

const link = (loc: Locale, id: string) => `[${PRACTICE_BY_ID.get(id)!.name[loc]}](${SITE_URL}/${loc}/practices/${id}/index.md)`;

const coreTag = (loc: Locale) => (loc === 'en' ? ' *(core)*' : ' *(Kern)*');

/** The petstore page as Markdown: every part with its description, signature, rules and the practices that check it. */
export function petstoreMarkdown(loc: Locale): string {
  const C = PETSTORE_COPY;
  const out = [`# ${C.title[loc]}`, '', C.intro[loc], '', `> ${C.story[loc]}`, '', `${C.gherkinText[loc]} ${C.gherkinRun[loc]}`, ''];
  out.push(loc === 'en'
    ? 'The system parts sit in three zones: before the code runs (agent setup, tests and CI, config and packages), the running petstore (browser UI, REST API, domain code, database, payment and mail) and production (deploy and rollout, monitoring). Data, operations and rules live in the domain code.'
    : 'Die Systemteile liegen in drei Zonen: bevor der Code läuft (Agent-Setup, Tests und CI, Config und Pakete), der laufende Petstore (Browser-UI, REST-API, Domain-Code, Datenbank, Payment und Mail) und Production (Deploy und Rollout, Monitoring). Daten, Operationen und Regeln liegen im Domain-Code.', '');
  for (const kind of KIND_ORDER) {
    out.push(`## ${C.kindHeading[kind][loc]}`, '');
    for (const p of PARTS.filter((x) => x.kind === kind)) {
      out.push(`### ${p.name[loc]}`, '', p.text[loc], '');
      if (p.zone) out.push(`- Zone: ${C.zone[p.zone][loc]}`);
      if (p.sig) out.push(`- \`${p.sig}\``);
      if (p.rules?.length) out.push(`- ${C.rulesLabel[loc]}: ${p.rules.map((r) => PART_BY_ID.get(r)!.name[loc]).join(', ')}`);
      const f = featureOf(p.id);
      if (f) out.push('', `${C.scenarios[loc]} (\`${f.file}\`):`, '', '```gherkin', f.text[loc], '```', '');
      const ps = practicesFor(p.id);
      out.push(`- ${C.usedBy[loc]}: ${ps.length ? '' : C.usedByNone[loc]}`);
      for (const x of ps) out.push(`  - ${link(loc, x.id)}: ${x.domain.what[loc]}`);
      out.push('');
    }
  }
  return out.join('\n');
}

export function homeMarkdown(loc: Locale): string {
  const out = [
    `# ${HOME.headline[loc]}`, '',
    HOME.lead[loc], '',
    HOME.markdownStart[loc], '',
    `- [${t(loc, 'navStart')}](${SITE_URL}/${loc}/start/index.md)`,
    `- [${HOME.diagnoseTitle[loc]}](${SITE_URL}/${loc}/diagnose/index.md)`,
    `- [${t(loc, 'navLifecycle')}](${SITE_URL}/${loc}/lifecycle/index.md)`,
    `- [${t(loc, 'navStack')}](${SITE_URL}/${loc}/stack/index.md)`,
    `- [${PETSTORE_COPY.open[loc]}](${SITE_URL}/${loc}/petstore/index.md): ${PETSTORE_COPY.homeWay[loc]}`, '',
    `## ${HOME.funnelTitle[loc]}`, '',
    HOME.funnelIntro[loc], '',
    HOME.markdownCore[loc], '',
  ];
  for (const layer of LAYERS) {
    const list = PRACTICES.filter((x) => x.layer === layer.id);
    out.push(`### ${layer.name[loc]}`, '', `${layer.examples[loc]}. ${layer.idea[loc]}`, '');
    for (const p of [...list.filter((x) => x.core), ...list.filter((x) => !x.core)]) out.push(`- ${link(loc, p.id)}${p.core ? coreTag(loc) : ''}: ${p.oneLiner[loc]}`);
    out.push('');
  }
  out.push(`## ${HOME.evidenceTitle[loc]}`, '', HOME.evidence[loc], '',
    HOME.markdownCredit[loc], '', `[${HOME.whyLayers[loc]}](${SITE_URL}/${loc}/why-layers/index.md)`, '');
  return out.join('\n');
}

export function lifecycleMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${LIFECYCLE_COPY.heading[loc]}`, '', LIFECYCLE_COPY.intro[loc], '', LIFECYCLE_COPY.details[loc], ''];
  for (const ph of PHASES) {
    out.push(`## ${ph.name[loc]}`, '');
    for (const p of PRACTICES.filter((x) => x.phases.includes(ph.id))) {
      const tags = `${p.core ? coreTag(loc) : ''}${p.fromOverview ? '' : en ? ' *(added)*' : ' *(ergänzt)*'}`;
      out.push(`- ${link(loc, p.id)}${tags}: ${p.oneLiner[loc]}`);
    }
    out.push('');
  }
  return out.join('\n');
}

export function glossaryMarkdown(loc: Locale): string {
  const terms = [...GLOSSARY].sort((a, b) => a.term[loc].localeCompare(b.term[loc], loc));
  const out = [`# ${loc === 'en' ? 'Glossary' : 'Glossar'}`, '', GLOSSARY_COPY.description[loc], ''];
  for (const x of terms) out.push(`- **${x.term[loc]}**: ${x.def[loc]}${x.see ? ` (${link(loc, x.see)})` : ''}`);
  out.push('');
  return out.join('\n');
}

export function aboutMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${en ? 'About this site' : 'Über diese Seite'}`, '',
    ABOUT_COPY.description[loc], '',
    `## ${en ? 'Credits' : 'Quellen der Ideen'}`, '',
    en ? '- The funnel (codebase, static analysis, verification, prose, human review) comes from a talk by Lauren Tan (@poteto).' : '- Der Trichter (Codebasis, statische Analyse, Verifikation, Prosa, menschliches Review) stammt aus einem Vortrag von Lauren Tan (@poteto).',
    en ? '- The lifecycle overview (pre-production to post-release) was originally drawn by Cindy Sridharan (@copyconstruct).' : '- Die Lebenszyklus-Übersicht (vor der Produktion bis nach dem Release) zeichnete ursprünglich Cindy Sridharan (@copyconstruct).',
    `- ${ABOUT_COPY.diagrams[loc]}`,
    `- ${en ? 'Talks and articles from practice that this site builds on' : 'Vorträge und Artikel aus der Praxis, auf denen diese Seite aufbaut'} ([${t(loc, 'navReferences')}](${SITE_URL}/${loc}/references/index.md)):`,
    ...REFERENCES.map((r) => `  - ${r.author}: [${r.title}](${r.url}) (${KIND[r.kind][loc]}, ${r.venue[loc]}${r.date ? `, ${r.date}` : ''})`), '',
    `## ${en ? 'How this site verifies itself' : 'Wie diese Seite sich selbst prüft'}`, '',
    ...ABOUT_COPY.checks(PRACTICES.length, TOOLS.length).map((check) => `- ${check[loc]}`), '',
    `## ${en ? 'Privacy' : 'Datenschutz'}`, '',
    ABOUT_COPY.privacy[loc], '',
    `## ${en ? 'All sources' : 'Alle Quellen'} (${SOURCES.length})`, ''];
  [...SOURCES].sort((a, b) => a.authors.localeCompare(b.authors)).forEach((s, i) => out.push(`${i + 1}. ${s.authors}. [${s.title}](${s.url}). ${s.venue}, ${s.year}.${s.preprint ? ' (preprint)' : ''}`));
  out.push('');
  return out.join('\n');
}

export function guidesIndexMarkdown(loc: Locale): string {
  const en = loc === 'en';
  return [`# ${en ? 'Getting started' : 'Einstieg'}`, '',
    GUIDES_INDEX_COPY.intro[loc], '',
    ...GUIDES.map((g) => `- [${g.title[loc]}](${SITE_URL}/${loc}/guides/${g.id}/index.md): ${g.outcome[loc]}`), ''].join('\n');
}

export function stackIndexMarkdown(loc: Locale): string {
  return [`# ${STACK_COPY.heading[loc]}`, '', STACK_COPY.intro[loc], '',
    ...LANGS.map((lg) => `- [${lg.name}](${SITE_URL}/${loc}/stack/${lg.id}/index.md)`), ''].join('\n');
}

/** The references page as Markdown: talks and articles from practice, with external URLs and related pages here. */
export function referencesMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${t(loc, 'navReferences')}`, '', REFERENCES_COPY.lede[loc], '',
    `${REFERENCES_COPY.noteBefore[loc]}[${REFERENCES_COPY.noteLink[loc]}](${SITE_URL}/${loc}/about/index.md).`, ''];
  for (const r of REFERENCES) {
    out.push(`## ${r.title}`, '',
      `- ${en ? 'Kind' : 'Art'}: ${KIND[r.kind][loc]}`,
      `- ${(r.kind === 'talk' ? REFERENCES_COPY.speaker : REFERENCES_COPY.author)[loc]}: ${r.author}`,
      `- ${REFERENCES_COPY.venue[loc]}: ${r.venue[loc]}`,
      ...(r.date ? [`- ${REFERENCES_COPY.date[loc]}: ${formatDate(r.date, loc)}`] : []),
      `- URL: ${r.url}`, '', r.about[loc], '');
    if (r.points?.length) out.push(`${REFERENCES_COPY.points[loc]}:`, '', ...r.points.map((p) => `- ${p[loc]}`), '');
    out.push(`${REFERENCES_COPY.related[loc]}:`, '',
      ...r.pages.map((p) => `- [${p.label[loc]}](${SITE_URL}/${loc}/${p.path.replace(/#.*$/, '')}index.md)`),
      ...r.practices.map((id) => `- ${link(loc, id)}`), '');
  }
  return out.join('\n');
}
