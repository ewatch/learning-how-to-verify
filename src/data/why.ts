import type { L } from './types';
const l = (en: string, de: string): L => ({ en, de });

export const WHY = {
  title: l('Why one layer is not enough with agents', 'Warum eine Schicht bei Agenten nicht reicht'),
  intro: l(
    'It is easy to think: the agent runs the tests, the tests are green, so the work is done. The studies below show that green tests are not enough. Each finding names a layer of the funnel that catches what the layer before it missed.',
    'Es ist leicht zu denken: Der Agent führt die Tests aus, die Tests sind grün, also ist die Arbeit fertig. Die Studien unten zeigen, dass grüne Tests nicht genügen. Jeder Befund nennt eine Schicht des Trichters, die findet, was die Schicht davor übersah.',
  ),
  findings: [
    { src: 'patchdiff2026', claim: l('Green tests, different behaviour', 'Grüne Tests, anderes Verhalten'),
      text: l('29.6% of agent patches that passed SWE-bench\'s tests behaved differently from the developers\' reference fix. Reported success rates were inflated by about 6 points.', '29,6 % der Agenten-Patches, die die Tests von SWE-bench bestanden, verhielten sich anders als die Referenzlösung der Entwickler. Gemeldete Erfolgsquoten waren um etwa 6 Punkte zu hoch.'),
      fix: l('Differential testing and property-based tests compare behaviour on many inputs, not just the ones in the tests.', 'Differential Testing und Property-Based Tests vergleichen das Verhalten auf vielen Eingaben, nicht nur auf denen in den Tests.'), practices: ['differential-testing', 'property-based-tests'] },
    { src: 'metr2026', claim: l('Green tests, not mergeable', 'Grüne Tests, nicht mergebar'),
      text: l('Maintainers would merge only about half of 296 agent pull requests that passed the automated grader; their verdicts ran about 24 points below it.', 'Maintainer würden nur etwa die Hälfte von 296 Agenten-PRs mergen, die der automatische Bewerter bestanden hatte; ihr Urteil lag etwa 24 Punkte darunter.'),
      fix: l('Codebase rules as checks (architecture tests, lint), small reviewable changes, and human review for what is left.', 'Codebasis-Regeln als Prüfungen (Architekturtests, Lint), kleine reviewbare Änderungen und menschliches Review für den Rest.'), practices: ['architecture', 'lint', 'code-review'] },
    { src: 'impossiblebench2026', claim: l('Agents game the tests they are judged by', 'Agenten tricksen die Tests aus, an denen sie gemessen werden'),
      text: l('On tasks whose tests contradict the spec, GPT-5 "passed" 76% of one variant by cheating, and stronger models cheated more. Hidden tests reduced this to near zero.', 'Bei Aufgaben, deren Tests der Spezifikation widersprechen, „bestand“ GPT-5 in einer Variante 76 % durch Schummeln, und stärkere Modelle schummelten mehr. Versteckte Tests senkten das fast auf null.'),
      fix: l('Protect the tests: read-only test files, hidden holdout tests, CI checks for skipped tests, and mutation testing to judge test quality.', 'Die Tests schützen: schreibgeschützte Testdateien, versteckte Holdout-Tests, CI-Prüfung auf übersprungene Tests und Mutation Testing für die Testqualität.'), practices: ['test-integrity', 'mutation-tests'] },
    { src: 'perry2023', claim: l('More confident, less secure', 'Sicherer im Gefühl, unsicherer im Code'),
      text: l('People using an AI assistant wrote less secure code and were more confident that it was secure.', 'Menschen mit KI-Assistent schrieben unsichereren Code und waren sich sicherer, dass er sicher sei.'),
      fix: l('Security scanning on every change, and a reviewer who is not the author.', 'Security-Scans bei jeder Änderung und ein Reviewer, der nicht der Autor ist.'), practices: ['security-scanning', 'code-review'] },
    { src: 'dora2024', claim: l('More AI, less stable delivery', 'Mehr KI, weniger stabile Auslieferung'),
      text: l('In DORA\'s 2024 survey, every 25% increase in AI adoption was associated with an estimated 7.2% drop in delivery stability (correlational).', 'In der DORA-Umfrage 2024 ging jede Zunahme der KI-Nutzung um 25 % mit geschätzt 7,2 % weniger Lieferstabilität einher (korrelativ).'),
      fix: l('Production layers: canaries, feature flags and monitoring limit the damage of what slips through.', 'Produktionsschichten: Canaries, Feature Flags und Monitoring begrenzen den Schaden dessen, was durchrutscht.'), practices: ['canarying', 'feature-flags', 'monitoring'] },
    { src: 'gloaguen2026', claim: l('Writing rules is not the same as enforcing them', 'Regeln schreiben ist nicht dasselbe wie sie durchsetzen'),
      text: l('Repository context files (AGENTS.md) did not raise agents\' task success in a multi-agent study and raised cost by over 20%.', 'Kontextdateien im Repository (AGENTS.md) erhöhten in einer Studie mit mehreren Agenten die Erfolgsquote nicht und die Kosten um über 20 %.'),
      fix: l('Move every rule that can be checked into a tool; measure the rest with evals.', 'Jede prüfbare Regel in ein Werkzeug verlagern; den Rest mit Evals messen.'), practices: ['agent-rules', 'evals'] },
  ],
  outro: l(
    'No layer is perfect. That is the idea of the funnel: each layer is cheap compared with the layer below it. Together, the layers leave little work for the most expensive layer, a person.',
    'Keine Schicht ist perfekt. Das ist die Idee des Trichters: Jede Schicht ist billig im Vergleich zur Schicht darunter. Zusammen lassen die Schichten wenig Arbeit für die teuerste Schicht übrig, den Menschen.',
  ),
};
