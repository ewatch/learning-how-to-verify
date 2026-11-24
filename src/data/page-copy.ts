const l = (en: string, de: string) => ({ en, de });

export const LIFECYCLE_COPY = {
  heading: l('When to run each check', 'Wann laufen die Checks?'),
  intro: l(
    'The lifecycle groups checks by when they run. The phases are before production, during deployment, at release and after release.',
    'Die Übersicht gruppiert Checks nach der Phase. Die Phasen sind vor dem Deploy, beim Deploy, beim Release und nach dem Release.',
  ),
  details: l(
    'A check can appear in several phases. The *core* label identifies a check to start with. The *added* label identifies a check that this site added to the original overview.',
    'Ein Check kann in mehreren Phasen vorkommen. Die Markierung *Kern* zeigt einen Check für den Einstieg. *ergänzt* markiert einen Check, den diese Seite zur ursprünglichen Übersicht hinzugefügt hat.',
  ),
};

export const GLOSSARY_COPY = {
  description: l('Definitions of technical terms on this site.', 'Kurze Definitionen der Begriffe auf dieser Seite.'),
  intro: l(
    'Select a term with a dotted underline on a practice page to read its definition.',
    'Wähle auf einer Seite einen gepunktet unterstrichenen Begriff. Der Link führt zur Definition.',
  ),
};

export const GUIDES_INDEX_COPY = {
  intro: l(
    'Use these guides to check a pet reservation or fee calculation. Each guide includes output from the tool. Introduce a known error to see how the tool reports it.',
    'Prüfe mit diesen Anleitungen eine Reservierung oder eine Gebühr. Jede Anleitung zeigt die Ausgabe des Tools. Füge einen bekannten Fehler hinzu, um die Meldung zu prüfen.',
  ),
};

export const STACK_COPY = {
  heading: l('Tools by programming language', 'Tools nach Programmiersprache'),
  intro: l(
    'Select a programming language to find its open-source tools. Each page also gives tools that work with any language, such as TLA+, k6 and OpenTelemetry.',
    'Wähle eine Programmiersprache, um passende Open-Source-Tools zu finden. Jede Seite nennt auch sprachunabhängige Tools wie TLA+, k6 und OpenTelemetry.',
  ),
  languageIntro: l(
    'Tools in bold are specific to this language. The other tools work with any language.',
    'Fett gedruckte Tools gelten für diese Sprache. Die anderen Tools sind sprachunabhängig.',
  ),
  coreIntro: l(
    'The core checks follow the order of the funnel. Each check also appears in its layer below.',
    'Die wichtigsten Checks folgen der Reihenfolge im Trichter. Jeder Check steht auch in seiner Schicht.',
  ),
};

export const ABOUT_COPY = {
  description: l(
    'This page gives the sources, the checks for this site and information about browser storage.',
    'Diese Seite nennt die Quellen, die Checks für diese Website und Informationen zum Datenschutz.',
  ),
  diagrams: l(
    'This site uses new versions of the original diagrams. The site authors wrote the practice pages.',
    'Diese Website zeichnet die ursprünglichen Diagramme neu. Die Autoren der Website haben die Seiten zu den Checks geschrieben.',
  ),
  checksIntro: l('This site uses the following checks.', 'Diese Seite nutzt die folgenden Checks.'),
  checks: (practices: number, tools: number) => [
    l('Run `astro check` with TypeScript in strict mode.', 'Führe `astro check` mit TypeScript im Strict Mode aus.'),
    l(
      `Data tests check that all ${practices} practices have complete entries in English and German. The tests also check tool, practice and source references.`,
      `Datentests prüfen, ob alle ${practices} Praktiken auf Englisch und Deutsch vollständig sind. Sie prüfen auch Verweise auf Tools, Praktiken und Quellen.`,
    ),
    l(
      `The license check compares the licenses of all ${tools} tools with the licenses on GitHub.`,
      `Der License Check vergleicht die Lizenzen aller ${tools} Tools mit den Angaben auf GitHub.`,
    ),
    l('Unit tests and fast-check property-based tests check the simulator engines.', 'Unit Tests und Property-Based Tests mit fast-check prüfen die Simulator-Engines.'),
    l('StrykerJS runs mutation tests on the simulator engines.', 'StrykerJS führt Mutation Tests für die Simulator-Engines aus.'),
    l(
      'Playwright runs smoke tests and axe accessibility checks in English and German.',
      'Playwright führt Smoke Tests und axe-Checks zur Barrierefreiheit auf Englisch und Deutsch aus.',
    ),
    l(
      'CI runs the TLA+ and Dafny examples again. CI fails if the output differs from the output in the guides.',
      'CI führt die TLA+- und Dafny-Beispiele erneut aus. CI schlägt fehl, wenn die Ausgabe von der in den Guides abweicht.',
    ),
  ],
  privacy: l(
    'The site uses no cookies or analytics. It loads fonts and scripts from this site. Your browser stores your theme and language choices. The simulators run in your browser.',
    'Die Website verwendet keine Cookies und keine Analytics. Sie lädt Schriftarten und Skripte von dieser Website. Dein Browser speichert die Darstellungs- und Sprachwahl. Die Simulatoren laufen im Browser.',
  ),
  sourcesNote: l(
    'The site authors checked each source against the publisher, DOI or arXiv page. The list marks preprints.',
    'Die Autoren prüfen die Quellen anhand der Verlagsseite, der DOI-Seite oder auf arXiv. Die Liste markiert Preprints.',
  ),
};
