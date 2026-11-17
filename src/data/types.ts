import type { PartId } from './petstore';

export type Locale = 'en' | 'de';
export const LOCALES: Locale[] = ['en', 'de'];

/** A string in both site languages. */
export type L = { en: string; de: string };

export type LayerId = 'codebase' | 'static' | 'verification' | 'prose' | 'review';
export type PhaseId = 'pre' | 'deploy' | 'release' | 'post';
export type LangId = 'js' | 'python' | 'php' | 'java' | 'dotnet' | 'go' | 'rust' | 'cpp' | 'any';
export type Rating = 'strong' | 'moderate' | 'weak' | 'none';

export interface Finding {
  text: L;
  /** key into SOURCES */
  src: string;
}

/** How a documented use relates to the practice: not a study of its effect. */
export type UseKind = 'adoption' | 'case' | 'standard' | 'guidance';

/** A documented use in industry: a company applying the practice, a standard that asks for it, or its adoption. */
export interface UseFinding {
  kind: UseKind;
  text: L;
  /** key into SOURCES */
  src: string;
}

export interface Evidence {
  rating: Rating;
  findings: Finding[];
}

export interface Snippet {
  lang: LangId;
  /** Setup, exercise and expected feedback, in both site languages. */
  description?: L;
  /** code shown as-is; comments in English (code is the lingua franca) */
  code: string;
  file?: string;
  /** What to look at: 2–4 marked lines with a short note each, in reading order. */
  focus?: Focus[];
}

/** A highlighted line (1-based) or inclusive line range inside a snippet, with a note. */
export interface Focus {
  line: number | [number, number];
  note: L;
}

export interface ThinkFirst {
  q: L;
  a: L;
}

export type VizKind = 'scope' | 'pipeline' | 'traffic' | 'load' | 'observe' | 'process';

export interface Practice {
  id: string;
  name: L;
  layer: LayerId;
  phases: PhaseId[];
  /** true = from Cindy Sridharan's overview */
  fromOverview: boolean;
  /** true = a core practice: shown first in long lists ("start with these") */
  core?: boolean;
  oneLiner: L;
  /** the bug class it catches */
  catches: L;
  /** why a newcomer needs it: a concrete problem (petstore or agent) and what the practice does about it; 2–3 short sentences */
  intro: L;
  /** 1 = cheap, 3 = expensive */
  cost: 1 | 2 | 3;
  feedback: 'seconds' | 'minutes' | 'hours' | 'days';
  worth: L[];
  limits: L[];
  /** why it matters when agents write the code */
  ai: L;
  evidence: { general: Evidence; ai: Evidence };
  /** tool ids per language; 'any' = language-independent */
  tools: Partial<Record<LangId, string[]>>;
  snippets?: Snippet[];
  /** steps for the "copy for your agent" prompt */
  steps: L[];
  /** definition of done for the agent prompt */
  done: L;
  think: ThinkFirst[];
  related: string[];
  /** variants folded into this page */
  variants?: { name: L; text: L }[];
  /** id of an interactive simulator or animation */
  sim?: string;
  /** an animated diagram ("See it"): reusable diagram kind + practice-specific mode */
  viz?: { kind: VizKind; mode: string };
  /** ids of getting-started guides */
  guides?: string[];
  /** which parts of the petstore example the exercise, diagram or snippet uses, and what it checks there (one short sentence) */
  domain: { parts: PartId[]; what: L };
}

export interface Tool {
  id: string;
  name: string;
  url: string;
  repo: string;
  license: string;
  langs: LangId[];
  /** short note, language-neutral or L */
  note?: L;
}

export interface Source {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  url: string;
  preprint?: boolean;
  /** false = cited from memory and not yet re-checked: build fails if used */
  verified: boolean;
}
