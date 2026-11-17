import type { Locale } from '../data/types';
import { LAYERS, LANGS, PHASES } from '../data/taxonomy';
import { PRACTICES } from '../data/practices';
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
  const en = loc === 'en';
  const out = [
    `# ${en ? 'Learning how to verify' : 'Verifizieren lernen'}`, '',
    en ? 'This site is for developers who let coding agents write code. It shows which checks catch which bugs, from cheap automatic checks to slow human review. Each practice lists open-source tools and shows an exercise or an animated diagram.'
       : 'Diese Seite ist für Entwicklerinnen und Entwickler, die Coding-Agenten Code schreiben lassen. Sie zeigt, welche Prüfungen welche Fehler finden, von billigen automatischen Prüfungen bis zum langsamen menschlichen Review. Jede Praktik nennt Open-Source-Werkzeuge und zeigt eine Übung oder ein animiertes Diagramm.', '',
    en ? `If you are new here, begin with [${t(loc, 'navStart')}](${SITE_URL}/${loc}/start/index.md). Other ways in:` : `Neu hier? Mit [${t(loc, 'navStart')}](${SITE_URL}/${loc}/start/index.md) beginnen. Andere Einstiege:`, '',
    `- [${t(loc, 'navLifecycle')}](${SITE_URL}/${loc}/lifecycle/index.md)`,
    `- [${t(loc, 'navStack')}](${SITE_URL}/${loc}/stack/index.md)`,
    `- [${PETSTORE_COPY.open[loc]}](${SITE_URL}/${loc}/petstore/index.md): ${PETSTORE_COPY.homeWay[loc]}`, '',
    `## ${en ? 'The funnel' : 'Der Trichter'}`, '',
    en ? `${PRACTICES.length} practices along a funnel from cheap automatic checks to expensive ones. Each layer of the funnel can catch a bug. If a higher layer catches the bug, the fix is cheaper and faster, and a person has less to review. Start with the practices marked *(core)*.`
       : `${PRACTICES.length} Praktiken entlang eines Trichters von billigen automatischen Prüfungen zu teuren. Jede Schicht des Trichters kann einen Fehler finden. Findet ihn eine höhere Schicht, ist die Korrektur billiger und schneller, und ein Mensch muss weniger prüfen. Mit *(Kern)* markierte Praktiken sind die für den Anfang.`, '',
  ];
  for (const layer of LAYERS) {
    const list = PRACTICES.filter((x) => x.layer === layer.id);
    out.push(`### ${layer.name[loc]}`, '', `${layer.examples[loc]}. ${layer.idea[loc]}`, '');
    for (const p of [...list.filter((x) => x.core), ...list.filter((x) => !x.core)]) out.push(`- ${link(loc, p.id)}${p.core ? coreTag(loc) : ''}: ${p.oneLiner[loc]}`);
    out.push('');
  }
  out.push(`## ${en ? 'How sure are we?' : 'Wie sicher ist das?'}`, '',
    en ? 'The funnel is a rule of thumb from practice (after a talk by Lauren Tan, @poteto), not a proven law. The evidence is strongest for the middle layers: tests as feedback for agents, mutation testing, fuzzing and formal methods. For prose such as AGENTS.md, the evidence is mixed. For the claim that a well-designed codebase makes agents more successful, we found no evidence. Each practice page rates its evidence for software engineering in general and for AI agents, with sources.'
       : 'Der Trichter ist eine Faustregel aus der Praxis (nach einem Vortrag von Lauren Tan, @poteto), kein bewiesenes Gesetz. Am stärksten ist die Evidenz für die mittleren Schichten: Tests als Feedback für Agenten, Mutation Testing, Fuzzing und formale Methoden. Für Prosa wie AGENTS.md ist die Evidenz gemischt. Für die Behauptung, dass eine gut gestaltete Codebasis Agenten erfolgreicher macht, haben wir keine Evidenz gefunden. Jede Praktikseite bewertet ihre Evidenz für die Softwaretechnik allgemein und für KI-Agenten, mit Quellen.', '');
  return out.join('\n');
}

export function lifecycleMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${en ? 'Lifecycle map: when does each check happen?' : 'Lebenszyklus: wann findet welche Prüfung statt?'}`, '',
    en ? 'This map sorts the practices by the time when they run: before production, at deploy, at release and after release. Use it to find the checks for one stage of a change. A practice can appear in more than one phase. *(core)* marks a practice to start with. *(added)* marks a practice that is not in the original overview by Cindy Sridharan; this site added it.'
       : 'Diese Karte sortiert die Praktiken nach dem Zeitpunkt: vor der Produktion, beim Deploy, beim Release und nach dem Release. Sie hilft, die Prüfungen für eine Phase einer Änderung zu finden. Eine Praktik kann in mehreren Phasen vorkommen. *(Kern)* markiert eine Praktik für den Anfang. *(ergänzt)* markiert eine Praktik, die nicht in Cindy Sridharans ursprünglicher Übersicht steht und auf dieser Seite ergänzt wurde.', ''];
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
  const out = [`# ${loc === 'en' ? 'Glossary' : 'Glossar'}`, '', loc === 'en' ? 'Short definitions of the terms that this site uses.' : 'Kurze Definitionen der Begriffe, die diese Seite verwendet.', ''];
  for (const x of terms) out.push(`- **${x.term[loc]}**: ${x.def[loc]}${x.see ? ` (${link(loc, x.see)})` : ''}`);
  out.push('');
  return out.join('\n');
}

export function aboutMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${en ? 'About this site' : 'Über diese Seite'}`, '',
    en ? 'This page names the origin of the ideas, lists all sources and explains the privacy rules. It also shows the checks that this site runs on itself.' : 'Diese Seite nennt die Herkunft der Ideen, listet alle Quellen und erklärt den Datenschutz. Sie zeigt auch die Prüfungen, die diese Seite an sich selbst ausführt.', '',
    `## ${en ? 'Credits' : 'Quellen der Ideen'}`, '',
    en ? '- The funnel (codebase, static analysis, verification, prose, human review) comes from a talk by Lauren Tan (@poteto).' : '- Der Trichter (Codebasis, statische Analyse, Verifikation, Prosa, menschliches Review) stammt aus einem Vortrag von Lauren Tan (@poteto).',
    en ? '- The lifecycle overview (pre-production to post-release) was originally drawn by Cindy Sridharan (@copyconstruct).' : '- Die Lebenszyklus-Übersicht (vor der Produktion bis nach dem Release) zeichnete ursprünglich Cindy Sridharan (@copyconstruct).',
    en ? '- Both diagrams are redrawn here; the content of each practice page is our own.' : '- Beide Diagramme sind hier neu gezeichnet; die Inhalte der Praktikseiten sind eigene.',
    `- ${en ? 'Talks and articles from practice that this site builds on' : 'Vorträge und Artikel aus der Praxis, auf denen diese Seite aufbaut'} ([${t(loc, 'navReferences')}](${SITE_URL}/${loc}/references/index.md)):`,
    ...REFERENCES.map((r) => `  - ${r.author}: [${r.title}](${r.url}) (${KIND[r.kind][loc]}, ${r.venue[loc]}${r.date ? `, ${r.date}` : ''})`), '',
    `## ${en ? 'How this site verifies itself' : 'Wie diese Seite sich selbst prüft'}`, '',
    ...(en ? [
      '- Types: `astro check` with TypeScript strict mode.',
      `- Data tests: every one of the ${PRACTICES.length} practices is complete in both languages and references only existing tools, practices and verified sources.`,
      `- License check: the license of each of the ${TOOLS.length} tools is compared with what GitHub reports.`,
      '- Unit and property-based tests for the simulator engines, with fast-check.',
      '- Mutation testing of those engines with StrykerJS.',
      '- End-to-end smoke tests with Playwright in both languages, including an accessibility scan.',
      '- Recorded tool output: the TLA+ and Dafny outputs in the guides are real runs; a CI job re-runs them and fails if they change.',
    ] : [
      '- Typen: `astro check` mit strengem TypeScript-Modus.',
      `- Datentests: jede der ${PRACTICES.length} Praktiken ist in beiden Sprachen vollständig und verweist nur auf existierende Werkzeuge, Praktiken und geprüfte Quellen.`,
      `- Lizenzprüfung: die Lizenz jedes der ${TOOLS.length} Werkzeuge wird mit der Angabe von GitHub verglichen.`,
      '- Unit- und Property-Based Tests für die Simulator-Engines, mit fast-check.',
      '- Mutation Testing dieser Engines mit StrykerJS.',
      '- End-to-End-Smoke-Tests mit Playwright in beiden Sprachen, inklusive Barrierefreiheits-Scan.',
      '- Aufgezeichnete Werkzeugausgabe: die TLA+- und Dafny-Ausgaben in den Anleitungen stammen aus echten Läufen; ein CI-Job wiederholt sie und scheitert, wenn sie sich ändern.',
    ]), '',
    `## ${en ? 'Privacy' : 'Datenschutz'}`, '',
    en ? 'No cookies, no analytics, no external fonts or scripts. Theme and language choice are stored only in your own browser. Simulators run entirely in your browser.' : 'Keine Cookies, keine Analyse, keine externen Schriften oder Skripte. Theme- und Sprachwahl werden nur im eigenen Browser gespeichert. Simulatoren laufen vollständig im Browser.', '',
    `## ${en ? 'All sources' : 'Alle Quellen'} (${SOURCES.length})`, ''];
  [...SOURCES].sort((a, b) => a.authors.localeCompare(b.authors)).forEach((s, i) => out.push(`${i + 1}. ${s.authors}. [${s.title}](${s.url}). ${s.venue}, ${s.year}.${s.preprint ? ' (preprint)' : ''}`));
  out.push('');
  return out.join('\n');
}

export function guidesIndexMarkdown(loc: Locale): string {
  const en = loc === 'en';
  return [`# ${en ? 'Getting started' : 'Einstieg'}`, '',
    en ? 'These guides cover the first hour with a tool. That hour is often the hardest part. Each guide uses the pet reservation example and shows the real output of the tool. In each guide, you break the example on purpose and read the failure.' : 'Diese Anleitungen begleiten die erste Stunde mit einem Werkzeug. Diese Stunde ist oft der schwerste Teil. Jede Anleitung nutzt das Beispiel der Tier-Reservierung und zeigt die echte Ausgabe des Werkzeugs. In jeder Anleitung machst du das Beispiel absichtlich kaputt und liest den Fehler.', '',
    ...GUIDES.map((g) => `- [${g.title[loc]}](${SITE_URL}/${loc}/guides/${g.id}/index.md): ${g.outcome[loc]}`), ''].join('\n');
}

export function stackIndexMarkdown(loc: Locale): string {
  const en = loc === 'en';
  return [`# ${en ? 'Which language do you work in?' : 'In welcher Sprache arbeitest du?'}`, '',
    en ? 'Use these pages to find tools for your programming language. Each page lists every practice with its open-source tools for that language.' : 'Diese Seiten helfen, Werkzeuge für deine Programmiersprache zu finden. Jede Seite nennt jede Praktik mit ihren Open-Source-Werkzeugen für diese Sprache.', '',
    ...LANGS.map((lg) => `- [${lg.name}](${SITE_URL}/${loc}/stack/${lg.id}/index.md)`), ''].join('\n');
}

/** The references page as Markdown: talks and articles from practice, with external URLs and related pages here. */
export function referencesMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${t(loc, 'navReferences')}`, '', REFERENCES_COPY.lede[loc], '',
    en ? `These are talks and articles from practice, not studies: the evidence ratings on the practice pages come from the studies on the About page (${SITE_URL}/en/about/index.md).`
       : `Das sind Vorträge und Artikel aus der Praxis, keine Studien: die Evidenzbewertungen auf den Praktikseiten stammen aus den Studien auf der Über-Seite (${SITE_URL}/de/about/index.md).`, ''];
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
