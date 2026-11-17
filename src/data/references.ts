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
      en: 'In this talk, Lauren Tan shows how to catch problems in code from coding agents as early and as cheaply as possible. The funnel on the home page and the order of its layers come from this talk. This site treats the funnel as a rule of thumb from practice, not as a proven law.',
      de: 'In diesem Vortrag zeigt Lauren Tan, wie man Probleme in Code von Coding-Agenten so früh und so billig wie möglich findet. Der Trichter auf der Startseite und die Reihenfolge seiner Schichten stammen aus diesem Vortrag. Diese Seite behandelt den Trichter als Faustregel aus der Praxis, nicht als bewiesenes Gesetz.',
    },
    practices: [],
    pages: [
      { path: '#funnel', label: { en: 'The funnel on the home page', de: 'Der Trichter auf der Startseite' } },
      { path: 'why-layers/', label: { en: 'Why one layer is not enough with agents', de: 'Warum eine Schicht mit Agenten nicht reicht' } },
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
      en: 'Addy Osmani describes how the Claude Code team checks the changes that agents make. An agent must run its change, and a change must not be able to modify its own checks. Many practice pages on this site describe the same checks.',
      de: 'Addy Osmani beschreibt, wie das Claude-Code-Team die Änderungen von Agenten prüft. Ein Agent muss seine Änderung ausführen, und eine Änderung darf ihre eigenen Prüfungen nicht ändern können. Viele Praktikseiten hier beschreiben dieselben Prüfungen.',
    },
    points: [
      { en: 'End-to-end tests, property-based tests and differential tests are the three test types most worth the investment for agents.', de: 'End-to-End-Tests, Property-Based Tests und Differential Tests sind die drei Testarten, die sich für Agenten am meisten lohnen.' },
      { en: 'To verify a change, the agent runs it. A verify skill and drivers for browser, mobile and desktop apps make this possible.', de: 'Um eine Änderung zu verifizieren, führt der Agent sie aus. Ein verify-Skill und Driver für Browser-, Mobile- und Desktop-Apps machen das möglich.' },
      { en: 'If the checks still fail after three rounds, a person takes over.', de: 'Scheitern die Prüfungen nach drei Runden noch, übernimmt ein Mensch.' },
      { en: 'The code owners of an area write the checks for that area.', de: 'Die Code Owner eines Bereichs schreiben die Prüfungen für diesen Bereich.' },
      { en: 'The diff of a change selects which reliability checks run.', de: 'Der Diff einer Änderung bestimmt, welche Zuverlässigkeitsprüfungen laufen.' },
      { en: 'The team uses one AI reviewer, not several. A REVIEW.md file tells it what to look for, and each review round builds on the earlier ones.', de: 'Das Team nutzt einen KI-Reviewer statt mehrerer. Eine REVIEW.md-Datei sagt ihm, worauf er achten soll, und jede Review-Runde baut auf den früheren auf.' },
      { en: 'A change cannot modify its own checks. The review configuration comes from the base branch.', de: 'Eine Änderung kann ihre eigenen Prüfungen nicht ändern. Die Review-Konfiguration kommt aus dem Base Branch.' },
      { en: 'A new check starts in observe mode. It moves from off to observe, and then to enforce.', de: 'Eine neue Prüfung startet im Modus observe. Sie geht von off über observe zu enforce.' },
      { en: 'The team measures each check against reverts and rejected changes.', de: 'Das Team misst jede Prüfung an Reverts und abgelehnten Änderungen.' },
      { en: 'Each problem that the checks missed becomes a new rule.', de: 'Jedes Problem, das die Prüfungen übersehen haben, wird zu einer neuen Regel.' },
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
    en: 'Talks and articles from practice that this site builds on, with the pages here that use them.',
    de: 'Vorträge und Artikel aus der Praxis, auf denen diese Seite aufbaut, mit den Seiten hier, die sie nutzen.',
  },
  lede: {
    en: 'This page lists the talks and articles that this site builds on. Each entry tells what it is and which pages here relate to it.',
    de: 'Diese Seite nennt die Vorträge und Artikel, auf denen diese Seite aufbaut. Jeder Eintrag sagt, worum es geht und welche Seiten hier dazu passen.',
  },
  noteBefore: { en: 'These are talks and articles from practice, not studies: the evidence ratings on the practice pages come from the ', de: 'Das sind Vorträge und Artikel aus der Praxis, keine Studien: die Evidenzbewertungen auf den Praktikseiten stammen aus den ' },
  noteLink: { en: 'studies on the About page', de: 'Studien auf der Über-Seite' },
  speaker: { en: 'Speaker', de: 'Vortrag von' },
  author: { en: 'Author', de: 'Autor' },
  venue: { en: 'Published by', de: 'Erschienen bei' },
  date: { en: 'Date', de: 'Datum' },
  points: { en: 'Main points, in our words', de: 'Die wichtigsten Punkte, in unseren Worten' },
  related: { en: 'Related pages on this site', de: 'Passende Seiten hier' },
  open: { talk: { en: 'Watch the talk', de: 'Vortrag ansehen' }, article: { en: 'Read the article', de: 'Artikel lesen' } },
  external: { en: 'external link', de: 'externer Link' },
} satisfies Record<string, L | Record<string, L>>;
