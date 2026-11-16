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

export interface Evidence {
  rating: Rating;
  findings: Finding[];
}

export interface Snippet {
  lang: LangId;
  /** code shown as-is; comments in English (code is the lingua franca) */
  code: string;
  file?: string;
}

export interface ThinkFirst {
  q: L;
  a: L;
}

export interface Practice {
  id: string;
  name: L;
  layer: LayerId;
  phases: PhaseId[];
  /** true = from Cindy Sridharan's overview */
  fromOverview: boolean;
  oneLiner: L;
  /** the bug class it catches */
  catches: L;
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
  /** ids of getting-started guides */
  guides?: string[];
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
