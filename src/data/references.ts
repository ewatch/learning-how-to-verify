import type { L } from './types';

/**
 * Practitioner references: talks and articles that this site builds on.
 * These are NOT evidence. Evidence ratings use only the studies in sources.ts.
 * Every entry was checked by the owner against its URL before it was added.
 */
export interface Reference {
  /** Stable anchor id on the references page, e.g. /en/references/#lauren-tan-talk */
  id: string;
  kind: 'talk' | 'article';
  title: string;
  /** Speaker of a talk or author of an article. */
  author: string;
  /** Publisher, channel or event. */
  venue: L;
  /** ISO date (YYYY-MM-DD). Leave out when it is not known; do not guess. */
  date?: string;
  url: string;
  /** 1–3 sentences: what it is and why it matters for this site. */
  about: L;
  /** Optional short list of the main points, in our own words. */
  points?: L[];
  /** Practice ids on this site that relate to the reference. */
  practices: string[];
  /** Other pages on this site: path after /{lang}/ ('' = home), optional #anchor. */
  pages: { path: string; label: L }[];
}

export const REFERENCES: Reference[] = [
  {
    id: 'lauren-tan-talk',
    kind: 'talk',
    title: 'All Code Is Slop (Except Mine)',
    author: 'Lauren Tan (@poteto)',
    venue: { en: 'AI Engineer, YouTube channel @aiDotEngineer', de: 'AI Engineer, YouTube-Kanal @aiDotEngineer' },
    url: 'https://www.youtube.com/watch?v=O_zcc6Xl12g',
    about: {
      en: 'Lauren Tan\'s talk gives the order of the layers in the verification funnel. The order uses checks with fast results and low cost first.',
      de: 'Der Vortrag von Lauren Tan gibt die Reihenfolge im Trichter vor. Die Reihenfolge beginnt mit Checks, die schnell Ergebnisse liefern und wenig kosten.',
    },
    practices: [],
    pages: [
      { path: '#funnel', label: { en: 'The funnel on the home page', de: 'Der Trichter auf der Startseite' } },
      { path: 'why-layers/', label: { en: 'Why different checks are necessary', de: 'Warum sich die Checks ergänzen' } },
    ],
  },
  {
    id: 'claude-code-verification',
    kind: 'article',
    title: 'How the Claude Code team thinks about verification',
    author: 'Addy Osmani',
    venue: { en: 'claude.dev blog (Engineering)', de: 'claude.dev Blog (Engineering)' },
    date: '2026-11-16',
    url: 'https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/',
    about: {
      en: 'The Claude Code team requires coding agents to run their changes. A change cannot modify the checks that evaluate it.',
      de: 'Das Claude-Code-Team verlangt, dass Coding-Agenten ihre Änderungen ausführen. Eine Änderung darf die zugehörigen Checks nicht ändern.',
    },
    points: [
      { en: 'The team recommends end-to-end tests, property-based tests and differential tests for changes from coding agents.', de: 'Das Team empfiehlt End-to-End Tests, Property-Based Tests und Differential Tests für Änderungen von Coding-Agenten.' },
      { en: 'The coding agent runs the change to examine its behavior. A verify skill and drivers let the agent run browser, mobile and desktop apps.', de: 'Der Coding-Agent führt die Änderung aus und prüft das Verhalten. Ein Verify Skill und Driver unterstützen Browser-, Mobile- und Desktop-Apps.' },
      { en: 'If the checks still fail after three attempts, a person takes responsibility for the task.', de: 'Wenn die Checks nach drei Versuchen noch fehlschlagen, übernimmt eine Person die Aufgabe.' },
      { en: 'The code owners of an area write the checks for that area.', de: 'Die Code Owner eines Bereichs schreiben die Prüfungen für diesen Bereich.' },
      { en: 'The diff of a change selects which reliability checks run.', de: 'Der Diff einer Änderung bestimmt, welche Zuverlässigkeitsprüfungen laufen.' },
      { en: 'The team uses one AI reviewer. REVIEW.md gives its review criteria. Each review round uses the results of earlier rounds.', de: 'Das Team verwendet einen KI-Reviewer. REVIEW.md enthält die Kriterien. Jede Review-Runde verwendet die Ergebnisse der vorherigen Runden.' },
      { en: 'A change cannot modify its own checks. The review configuration comes from the base branch.', de: 'Eine Änderung kann ihre eigenen Prüfungen nicht ändern. Die Review-Konfiguration kommt aus dem Base Branch.' },
      { en: 'A check starts in the off state. In observe mode, the check records findings. In enforce mode, the check can block a change.', de: 'Ein neuer Check beginnt im Modus off. Im Modus observe erfasst der Check seine Findings. Im Modus enforce kann er eine Änderung blockieren.' },
      { en: 'The team measures each check against reverts and rejected changes.', de: 'Das Team misst jede Prüfung an Reverts und abgelehnten Änderungen.' },
      { en: 'The team adds a rule for each problem that the checks did not detect.', de: 'Jedes Problem, das die Prüfungen übersehen haben, wird zu einer neuen Regel.' },
    ],
    practices: ['e2e-tests', 'property-based-tests', 'differential-testing', 'test-integrity', 'ci', 'code-review', 'agent-rules', 'evals', 'smoke-tests'],
    pages: [],
  },
];

export const REFERENCE_BY_ID = new Map(REFERENCES.map((r) => [r.id, r]));

/** Host name without "www.", shown next to an external link so the reader sees that it leaves the site. */
export const domainOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** Long date in the page language, or undefined. */
export const formatDate = (iso: string | undefined, lang: 'en' | 'de') =>
  iso && new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

export const REFERENCE_KIND: Record<Reference['kind'], L> = {
  talk: { en: 'Talk', de: 'Vortrag' },
  article: { en: 'Article', de: 'Artikel' },
};

/** Page copy for /[lang]/references/ and its Markdown twin. */
export const REFERENCES_COPY = {
  description: {
    en: 'Talks and articles that describe verification in practice. Each entry links to related pages on this site.',
    de: 'Vorträge und Artikel über Checks in der Praxis. Jeder Eintrag verweist auf passende Seiten.',
  },
  lede: {
    en: 'Talks and articles about verification in practice.',
    de: 'Vorträge und Artikel über Checks in der Praxis.',
  },
  noteBefore: { en: 'Evidence ratings use the ', de: 'Die Evidenzbewertungen stützen sich auf die ' },
  noteLink: { en: 'studies on the About page', de: 'Studien auf der Über-Seite' },
  speaker: { en: 'Speaker', de: 'Vortrag von' },
  author: { en: 'Author', de: 'Autor' },
  venue: { en: 'Published by', de: 'Erschienen bei' },
  date: { en: 'Date', de: 'Datum' },
  points: { en: 'Summary', de: 'Zusammenfassung' },
  related: { en: 'Related pages on this site', de: 'Passende Seiten hier' },
  open: { talk: { en: 'Watch the talk', de: 'Vortrag ansehen' }, article: { en: 'Read the article', de: 'Artikel lesen' } },
  external: { en: 'external link', de: 'externer Link' },
} satisfies Record<string, L | Record<string, L>>;
