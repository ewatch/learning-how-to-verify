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
    examples: { en: 'API design, architecture, refactoring', de: 'gutes API-Design, Architektur, Refactoring' },
    idea: {
      en: 'An API is easier to use correctly if it has a small number of entry points. Clear module boundaries help you find where to change the code.',
      de: 'Eine API mit wenigen Einstiegspunkten lässt sich leichter richtig benutzen. Klare Modulgrenzen zeigen, wo eine Änderung hingehört.',
    },
  },
  {
    id: 'static',
    name: { en: 'Static analysis', de: 'Statische Analyse' },
    examples: { en: 'linters, types, compilers, tests, CI', de: 'Linter, Typen, Compiler, Tests, CI' },
    idea: {
      en: 'Linters, compilers and tests apply the same rules to each change. A coding agent can read the results, change the code and run the checks again.',
      de: 'Linter, Compiler und Tests prüfen jede Änderung nach denselben Regeln. Ein Coding-Agent kann die Ergebnisse lesen. Danach kann er den Code ändern und die Checks erneut ausführen.',
    },
  },
  {
    id: 'verification',
    name: { en: 'Verification', de: 'Verifikation' },
    examples: { en: 'formal, runtime', de: 'formal, zur Laufzeit' },
    idea: {
      en: 'Formal methods can show that a property is true for all inputs. Runtime checks compare actual behavior with expected behavior. Both can find errors that a set of test cases does not show.',
      de: 'Formale Methoden können zeigen, dass eine Eigenschaft für alle Eingaben gilt. Checks zur Laufzeit vergleichen das tatsächliche Verhalten mit dem erwarteten. Beide Verfahren können Fehler finden, die einzelne Testfälle übersehen.',
    },
  },
  {
    id: 'prose',
    name: { en: 'Prose', de: 'Prosa' },
    examples: { en: 'rules, skills, AGENTS.md', de: 'Regeln, Skills, AGENTS.md' },
    idea: {
      en: 'Files such as AGENTS.md give instructions to coding agents. A coding agent must read and obey a rule for the rule to have an effect.',
      de: 'AGENTS.md enthält Regeln für Coding-Agenten. Die Regeln wirken nur, wenn der Coding-Agent sie liest und befolgt.',
    },
  },
  {
    id: 'review',
    name: { en: 'Human review', de: 'Menschliches Review' },
    examples: { en: 'code review, approval', de: 'Code-Review, Freigabe' },
    idea: {
      en: 'In code review, a person examines the change to make sure that it is correct for the project. Each error that an earlier check finds decreases the work for the reviewer.',
      de: 'Im Code Review prüft eine Person, ob die Änderung die Anforderungen erfüllt. Früh gefundene Fehler verringern den Aufwand für die Person.',
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
