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
      en: 'Make wrong code hard to write in the first place. Clear module boundaries and narrow interfaces leave fewer places for a bug to hide.',
      de: 'Falschen Code von vornherein schwer schreibbar machen. Klare Modulgrenzen und schmale Schnittstellen lassen Fehlern weniger Versteck.',
    },
  },
  {
    id: 'static',
    name: { en: 'Static analysis', de: 'Statische Analyse' },
    examples: { en: 'lints, types, compilers, tests, CI', de: 'Linter, Typen, Compiler, Tests, CI' },
    idea: {
      en: 'Machines check every change, in seconds, the same way every time. This is the feedback an agent can loop on without asking anyone.',
      de: 'Maschinen prüfen jede Änderung, in Sekunden, jedes Mal gleich. Auf dieses Feedback kann ein Agent reagieren, ohne jemanden zu fragen.',
    },
  },
  {
    id: 'verification',
    name: { en: 'Verification', de: 'Verifikation' },
    examples: { en: 'formal, runtime', de: 'formal, zur Laufzeit' },
    idea: {
      en: 'Prove properties for all inputs, or watch the running system against what it should do. Slower and costlier, but it finds what examples miss.',
      de: 'Eigenschaften für alle Eingaben beweisen oder das laufende System gegen sein Soll beobachten. Langsamer und teurer, findet aber, was Beispiele übersehen.',
    },
  },
  {
    id: 'prose',
    name: { en: 'Prose', de: 'Prosa' },
    examples: { en: 'rules, skills, AGENTS.md', de: 'Regeln, Skills, AGENTS.md' },
    idea: {
      en: 'Written guidance for humans and agents. Cheap to write, but nothing enforces it: a rule is followed only if someone reads and obeys it.',
      de: 'Geschriebene Anleitung für Menschen und Agenten. Billig zu schreiben, aber nichts erzwingt sie: Eine Regel gilt nur, wenn sie gelesen und befolgt wird.',
    },
  },
  {
    id: 'review',
    name: { en: 'Human review', de: 'Menschliches Review' },
    examples: { en: 'code review, approval', de: 'Code-Review, Freigabe' },
    idea: {
      en: 'A person judges the change. The most expensive and least scalable check, so it should only see what the layers above could not catch.',
      de: 'Ein Mensch beurteilt die Änderung. Die teuerste und am schlechtesten skalierende Prüfung. Sie sollte nur sehen, was die Schichten darüber nicht abfangen konnten.',
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
