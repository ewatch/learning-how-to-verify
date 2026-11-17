import type { L, LangId, LayerId, PhaseId } from './types';

export interface Layer {
  id: LayerId;
  name: L;
  examples: L;
  idea: L;
}

/** The funnel, top (cheapest, catches most) to bottom (most expensive). After Lauren Tan (@poteto). */
export const LAYERS: Layer[] = [
  {
    id: 'codebase',
    name: { en: 'Codebase', de: 'Codebasis' },
    examples: { en: 'good API design, architecture, refactoring', de: 'gutes API-Design, Architektur, Refactoring' },
    idea: {
      en: 'Make wrong code hard to write. Clear module boundaries and narrow interfaces give a bug fewer places to hide.',
      de: 'Falschen Code schwer schreibbar machen. Klare Modulgrenzen und schmale Schnittstellen geben Fehlern weniger Verstecke.',
    },
  },
  {
    id: 'static',
    name: { en: 'Static analysis', de: 'Statische Analyse' },
    examples: { en: 'linters, types, compilers, tests, CI', de: 'Linter, Typen, Compiler, Tests, CI' },
    idea: {
      en: 'Machines check every change in seconds, and they check it the same way every time. An agent can use this feedback again and again without a person.',
      de: 'Maschinen prüfen jede Änderung in Sekunden, jedes Mal gleich. Ein Agent kann dieses Feedback immer wieder nutzen, ohne einen Menschen zu fragen.',
    },
  },
  {
    id: 'verification',
    name: { en: 'Verification', de: 'Verifikation' },
    examples: { en: 'formal, runtime', de: 'formal, zur Laufzeit' },
    idea: {
      en: 'Prove properties for all inputs, or compare the running system with its expected behaviour. These checks are slower and more expensive, but they find bugs that examples miss.',
      de: 'Eigenschaften für alle Eingaben beweisen oder das laufende System mit seinem erwarteten Verhalten vergleichen. Diese Prüfungen sind langsamer und teurer, finden aber Fehler, die Beispiele übersehen.',
    },
  },
  {
    id: 'prose',
    name: { en: 'Prose', de: 'Prosa' },
    examples: { en: 'rules, skills, AGENTS.md', de: 'Regeln, Skills, AGENTS.md' },
    idea: {
      en: 'Rules files give written instructions to people and agents. They are cheap to write, but no tool enforces them. A rule has an effect only if someone reads it and obeys it.',
      de: 'Regeldateien geben Menschen und Agenten schriftliche Anweisungen. Sie sind billig zu schreiben, aber kein Werkzeug setzt sie durch. Eine Regel wirkt nur, wenn jemand sie liest und befolgt.',
    },
  },
  {
    id: 'review',
    name: { en: 'Human review', de: 'Menschliches Review' },
    examples: { en: 'code review, approval', de: 'Code-Review, Freigabe' },
    idea: {
      en: 'A person judges the change. This is the most expensive check, and it does not scale well. Give it only what the layers above cannot catch.',
      de: 'Ein Mensch beurteilt die Änderung. Das ist die teuerste Prüfung, und sie skaliert schlecht. Sie sollte nur sehen, was die Schichten darüber nicht finden können.',
    },
  },
];

export interface Phase {
  id: PhaseId;
  name: L;
  group: L;
}

/** Lifecycle, after Cindy Sridharan (@copyconstruct). */
export const PHASES: Phase[] = [
  { id: 'pre', name: { en: 'Pre-production', de: 'Vor der Produktion' }, group: { en: 'Pre-production', de: 'Vor der Produktion' } },
  { id: 'deploy', name: { en: 'Deploy', de: 'Deploy' }, group: { en: 'Testing in production', de: 'Testen in Produktion' } },
  { id: 'release', name: { en: 'Release', de: 'Release' }, group: { en: 'Testing in production', de: 'Testen in Produktion' } },
  { id: 'post', name: { en: 'Post-release', de: 'Nach dem Release' }, group: { en: 'Testing in production', de: 'Testen in Produktion' } },
];

export interface ProgLang {
  id: LangId;
  name: string;
  /** CodeMirror / highlight hint */
  short: string;
}

export const LANGS: ProgLang[] = [
  { id: 'js', name: 'JavaScript / TypeScript', short: 'JS/TS' },
  { id: 'python', name: 'Python', short: 'Python' },
  { id: 'php', name: 'PHP', short: 'PHP' },
  { id: 'java', name: 'Java / Kotlin', short: 'Java' },
  { id: 'dotnet', name: 'C# / .NET', short: 'C#' },
  { id: 'go', name: 'Go', short: 'Go' },
  { id: 'rust', name: 'Rust', short: 'Rust' },
  { id: 'cpp', name: 'C / C++', short: 'C/C++' },
];

export const ANY_LANG: ProgLang = { id: 'any', name: 'Any language', short: 'Any' };

export const RATING_LABEL: Record<string, L> = {
  strong: { en: 'strong', de: 'stark' },
  moderate: { en: 'moderate', de: 'mittel' },
  weak: { en: 'weak', de: 'schwach' },
  none: { en: 'none found', de: 'keine gefunden' },
};

export const FEEDBACK_LABEL: Record<string, L> = {
  seconds: { en: 'seconds', de: 'Sekunden' },
  minutes: { en: 'minutes', de: 'Minuten' },
  hours: { en: 'hours', de: 'Stunden' },
  days: { en: 'days or longer', de: 'Tage oder länger' },
};

export const COST_LABEL: Record<number, L> = {
  1: { en: 'cheap', de: 'günstig' },
  2: { en: 'medium', de: 'mittel' },
  3: { en: 'expensive', de: 'teuer' },
};
