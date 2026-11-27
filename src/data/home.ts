export const HOME = {
  headline: {
    en: 'Verification of code from coding agents',
    de: 'Code von Coding-Agenten prüfen',
  },
  lead: {
    en: 'Different checks find different bugs. Learn what each check finds, try it in your browser and get open-source tools for your programming language.',
    de: 'Verschiedene Checks finden verschiedene Fehler. Hier lernst du, was jeder Check findet, probierst ihn im Browser aus und findest Open-Source-Tools für deine Programmiersprache.',
  },
  start: {
    en: (steps: number) => `Start with ${steps} steps`,
    de: (steps: number) => `In ${steps} Schritten einsteigen`,
  },
  overview: { en: 'Find checks in the funnel', de: 'Alle Checks ansehen' },
  facts: {
    en: (n: number, sims: number) => `${n} practices · ${sims} simulators in your browser · English and Deutsch`,
    de: (n: number, sims: number) => `${n} Praktiken · ${sims} Simulatoren im Browser · Deutsch und English`,
  },
  funnelTitle: {
    en: 'The verification funnel',
    de: 'Welche Checks kommen zuerst?',
  },
  funnelIntro: {
    en: 'Start with the checks at the top of the funnel. They usually cost less and give results sooner. Each bug that they find is less work in code review.',
    de: 'Beginne mit den Checks oben im Trichter. Sie liefern meist schneller Ergebnisse und kosten weniger. Jeder früh gefundene Fehler verringert den Aufwand im Code Review.',
  },
  markdownStart: {
    en: 'Select a page for your task.',
    de: 'Beginne mit den ersten Schritten oder wähle einen Einstieg für dein Projekt.',
  },
  markdownCore: {
    en: 'Start with the checks that have the *core* label.',
    de: 'Die Markierung *Kern* zeigt dir, mit welchen Checks du anfangen kannst.',
  },
  chooseLayer: { en: 'Choose a layer', de: 'Wähle eine Schicht' },
  chooseLayerHint: {
    en: 'Select a layer in the funnel or in the list to see its checks.',
    de: 'Wähle eine Schicht im Trichter oder in der Liste, um ihre Checks zu sehen.',
  },
  waysTitle: { en: 'Other starting points', de: 'Weitere Einstiege' },
  diagnoseTitle: { en: 'Find a check for your project', de: 'Einen Check für dein Projekt finden' },
  diagnose: {
    en: 'Select a problem in your project. For each problem, the page gives you a check, an exercise and a task for your coding agent.',
    de: 'Wähle ein Problem aus deinem Projekt. Die Seite zeigt einen Check, eine Übung und eine Aufgabe für deinen Coding-Agenten.',
  },
  lifecycle: {
    en: 'Find checks for each phase of a change: before production, during deployment, at release and after release.',
    de: 'Finde Checks für jede Phase. Die Übersicht zeigt Checks vor dem Deploy, beim Deploy, zum Release und danach.',
  },
  stack: {
    en: 'Find open-source tools for your programming language.',
    de: 'Finde Open-Source-Tools für deine Programmiersprache.',
  },
  evidenceTitle: { en: 'Research on the checks', de: 'Forschung zu den Checks' },
  evidence: {
    en: 'The order of the checks in the funnel comes from software development practice. Studies give the clearest results for tests as feedback for coding agents, mutation testing, fuzzing and formal methods. Studies of instructions in files such as AGENTS.md give different results. The effect of codebase design on coding agents is unknown. The pages for the checks give the sources.',
    de: 'Die Reihenfolge im Trichter beruht auf praktischer Erfahrung. Studien liefern die klarsten Ergebnisse zu Tests als Feedback, Mutation Testing, Fuzzing und formalen Methoden. Studien zu AGENTS.md liefern unterschiedliche Ergebnisse. Die Wirkung des Codebase Designs bleibt offen. Die Seite zu jedem Check nennt die Quellen.',
  },
  markdownCredit: {
    en: 'The funnel comes from a talk by Lauren Tan (@poteto).',
    de: 'Der Trichter geht auf einen Vortrag von Lauren Tan (@poteto) zurück.',
  },
  whyLayers: {
    en: 'Why different checks are necessary',
    de: 'Warum sich die Checks ergänzen',
  },
  forAgents: { en: 'For coding agents', de: 'Für Coding-Agenten' },
  giveAgent: { en: 'Give your coding agent', de: 'Gib deinem Coding-Agenten' },
  appendMarkdown: {
    en: '. To open the Markdown version of a page, add',
    de: '. Füge für die Markdown-Fassung einer Seite',
  },
  markdownEnd: { en: 'to the end of its URL.', de: 'am Ende der URL hinzu.' },
};
