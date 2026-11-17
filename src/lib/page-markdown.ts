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

const link = (loc: Locale, id: string) => `[${PRACTICE_BY_ID.get(id)!.name[loc]}](${SITE_URL}/${loc}/practices/${id}/index.md)`;

const coreTag = (loc: Locale) => (loc === 'en' ? ' *(core)*' : ' *(Kern)*');

export function homeMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [
    `# ${en ? 'Learning how to verify' : 'Verifizieren lernen'}`, '',
    en ? 'For developers who let AI agents write code and need to know that the code is right: which checks catch which bugs, from cheap and automatic to slow and human, with tools for your language and exercises that run in your browser.'
       : 'Für Entwicklerinnen und Entwickler, die KI-Agenten Code schreiben lassen und wissen müssen, ob er stimmt: welche Prüfungen welche Fehler finden, von billig und automatisch bis langsam und menschlich, mit Werkzeugen für die eigene Sprache und Übungen im Browser.', '',
    en ? `New here? Begin with [Start here](${SITE_URL}/${loc}/start/index.md). Other ways in:` : `Neu hier? Mit [Hier starten](${SITE_URL}/${loc}/start/index.md) beginnen. Andere Einstiege:`, '',
    `- [${t(loc, 'navLifecycle')}](${SITE_URL}/${loc}/lifecycle/index.md)`,
    `- [${t(loc, 'navStack')}](${SITE_URL}/${loc}/stack/index.md)`, '',
    `## ${en ? 'The funnel' : 'Der Trichter'}`, '',
    en ? `${PRACTICES.length} practices along a funnel from cheap, automatic checks to expensive ones. Every bug is caught somewhere. The higher up it is caught, the cheaper and faster the fix, and the less a human has to look at. Practices marked *(core)* are the ones to start with.`
       : `${PRACTICES.length} Praktiken entlang eines Trichters von billigen, automatischen Prüfungen zu teuren. Jeder Fehler wird irgendwo gefunden. Je weiter oben, desto billiger und schneller die Korrektur, und desto weniger muss ein Mensch ansehen. Mit *(Kern)* markierte Praktiken sind die für den Anfang.`, '',
  ];
  for (const layer of LAYERS) {
    const list = PRACTICES.filter((x) => x.layer === layer.id);
    out.push(`### ${layer.name[loc]}`, '', `${layer.examples[loc]}. ${layer.idea[loc]}`, '');
    for (const p of [...list.filter((x) => x.core), ...list.filter((x) => !x.core)]) out.push(`- ${link(loc, p.id)}${p.core ? coreTag(loc) : ''}: ${p.oneLiner[loc]}`);
    out.push('');
  }
  out.push(`## ${en ? 'How sure are we?' : 'Wie sicher ist das?'}`, '',
    en ? 'The funnel is a practitioner rule of thumb (after a talk by Lauren Tan, @poteto), not a proven law. Evidence is strongest in the middle layers (tests as feedback for agents, mutation testing, fuzzing, formal methods), mixed for prose such as AGENTS.md, and missing for the claim that a well-designed codebase makes agents more successful. Each practice page rates its evidence for software engineering in general and for AI agents, with sources.'
       : 'Der Trichter ist eine Faustregel aus der Praxis (nach einem Vortrag von Lauren Tan, @poteto), kein bewiesenes Gesetz. Am stärksten ist die Evidenz in den mittleren Schichten (Tests als Feedback für Agenten, Mutation Testing, Fuzzing, formale Methoden), gemischt für Prosa wie AGENTS.md, und sie fehlt für die Behauptung, dass eine gut gestaltete Codebasis Agenten erfolgreicher macht. Jede Praktikseite bewertet ihre Evidenz für die Softwaretechnik allgemein und für KI-Agenten, mit Quellen.', '');
  return out.join('\n');
}

export function lifecycleMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${en ? 'Lifecycle map: when does each check happen?' : 'Lebenszyklus: wann findet welche Prüfung statt?'}`, '',
    en ? 'Practices grouped by phase. A practice can appear in several phases. *(core)* marks a practice to start with; *(added)* marks one that is not in Cindy Sridharan\'s original overview and was added on this site.'
       : 'Praktiken nach Phase gruppiert. Eine Praktik kann in mehreren Phasen vorkommen. *(Kern)* markiert eine Praktik für den Anfang; *(ergänzt)* markiert eine, die nicht in Cindy Sridharans ursprünglicher Übersicht steht und auf dieser Seite ergänzt wurde.', ''];
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
  const out = [`# ${loc === 'en' ? 'Glossary' : 'Glossar'}`, ''];
  for (const x of terms) out.push(`- **${x.term[loc]}**: ${x.def[loc]}${x.see ? ` (${link(loc, x.see)})` : ''}`);
  out.push('');
  return out.join('\n');
}

export function aboutMarkdown(loc: Locale): string {
  const en = loc === 'en';
  const out = [`# ${en ? 'About this site' : 'Über diese Seite'}`, '', `## ${en ? 'Credits' : 'Quellen der Ideen'}`, '',
    en ? '- The funnel (codebase, static analysis, verification, prose, human review) comes from a talk by Lauren Tan (@poteto).' : '- Der Trichter (Codebasis, statische Analyse, Verifikation, Prosa, menschliches Review) stammt aus einem Vortrag von Lauren Tan (@poteto).',
    en ? '- The lifecycle overview (pre-production to post-release) was originally drawn by Cindy Sridharan (@copyconstruct).' : '- Die Lebenszyklus-Übersicht (vor der Produktion bis nach dem Release) zeichnete ursprünglich Cindy Sridharan (@copyconstruct).',
    en ? '- Both diagrams are redrawn here; the content of each practice page is our own.' : '- Beide Diagramme sind hier neu gezeichnet; die Inhalte der Praktikseiten sind eigene.', '',
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
    en ? 'Step-by-step guides for tools where the first hour is the hard part, with real recorded output.' : 'Schritt-für-Schritt-Anleitungen für Werkzeuge, bei denen die erste Stunde die schwerste ist, mit echter aufgezeichneter Ausgabe.', '',
    ...GUIDES.map((g) => `- [${g.title[loc]}](${SITE_URL}/${loc}/guides/${g.id}/index.md): ${g.outcome[loc]}`), ''].join('\n');
}

export function stackIndexMarkdown(loc: Locale): string {
  const en = loc === 'en';
  return [`# ${en ? 'Which language do you work in?' : 'In welcher Sprache arbeitest du?'}`, '',
    en ? 'One page per language, with every practice and its open-source tools.' : 'Eine Seite pro Sprache, mit jeder Praktik und den Open-Source-Werkzeugen dafür.', '',
    ...LANGS.map((lg) => `- [${lg.name}](${SITE_URL}/${loc}/stack/${lg.id}/index.md)`), ''].join('\n');
}
