import type { L } from './types';
const l = (en: string, de: string): L => ({ en, de });

export const WHY = {
  title: l('Why different checks are necessary', 'Warum sich die Checks ergänzen'),
  intro: l(
    'A passing test gives information about the cases it runs. Each study below shows a different type of failure. The page gives checks for each type.',
    'Ein bestandener Test gibt Auskunft über die geprüften Fälle. Jede Studie zeigt eine andere Fehlerart. Zu jeder Fehlerart nennt die Seite passende Checks.',
  ),
  findings: [
    { src: 'patchdiff2026', claim: l('Different behavior with passing tests', 'Abweichungen trotz bestandener Tests'),
      text: l('In the study, 29.6% of patches that passed the SWE-bench tests behaved differently from the reference fix. Reported success rates were approximately six percentage points higher.', 'In der Studie wichen 29,6 % der Patches mit bestandenen SWE-bench-Tests von der Referenzlösung ab. Die gemeldete Erfolgsquote lag etwa sechs Prozentpunkte höher.'),
      fix: l('Use differential testing or property-based tests to examine behavior over more inputs.', 'Verwende Differential Testing oder Property-Based Testing. Prüfe damit das Verhalten für weitere Eingaben.'), practices: ['differential-testing', 'property-based-tests'] },
    { src: 'metr2026', claim: l('Changes that maintainers would reject', 'Änderungen, die Maintainer ablehnen würden'),
      text: l('Maintainers would merge approximately half of the 296 agent pull requests that passed the automated grader. Their acceptance rate was approximately 24 percentage points lower.', 'Maintainer würden etwa die Hälfte der 296 Pull Requests mit bestandener automatischer Bewertung mergen. Ihre Quote lag etwa 24 Prozentpunkte niedriger.'),
      fix: l('Make architecture and lint rules automatic where possible. Keep changes small enough for a person to review.', 'Prüfe Architektur- und Lint-Regeln automatisch. Halte Änderungen klein genug für ein Code Review.'), practices: ['architecture', 'lint', 'code-review'] },
    { src: 'impossiblebench2026', claim: l('Passing tests with an incorrect solution', 'Bestandene Tests bei falscher Lösung'),
      text: l('In one benchmark variant, GPT-5 passed 76% of the impossible tasks without a correct solution. Stronger models did this more frequently. Hidden tests decreased this behavior to almost zero.', 'GPT-5 bestand in einer Benchmark-Variante 76 % der unlösbaren Aufgaben ohne korrekte Lösung. Stärkere Modelle taten das häufiger. Versteckte Tests senkten dieses Verhalten fast auf null.'),
      fix: l('Protect the test files with CODEOWNERS enforced by branch protection on your Git host. Run hidden holdout tests and a skip check in CI. Use mutation testing to examine test quality.', 'Schütze die Testdateien mit CODEOWNERS und Branch Protection auf dem Git-Host. Führe versteckte Holdout-Tests und einen Skip-Check in CI aus. Prüfe die Testqualität mit Mutation Testing.'), practices: ['test-integrity', 'mutation-tests'] },
    { src: 'perry2023', claim: l('Security of code from AI assistants', 'Sicherheit von Code mit KI-Unterstützung'),
      text: l('Participants with an AI assistant wrote less secure code. They also had more confidence in its security.', 'Teilnehmer mit KI-Assistent schrieben weniger sicheren Code. Sie hielten ihren Code häufiger für sicher.'),
      fix: l('Run security scans on each change. Require a separate reviewer.', 'Führe für jede Änderung Security-Scans aus. Lass die Änderung von einer zweiten Person prüfen.'), practices: ['security-scanning', 'code-review'] },
    { src: 'dora2024', claim: l('AI use and delivery stability', 'KI-Nutzung und Stabilität der Auslieferung'),
      text: l('In the 2024 DORA survey, a 25% increase in AI adoption corresponded to an estimated 7.2% decrease in delivery stability. This result is a correlation.', 'In der DORA-Umfrage 2024 ging 25 % mehr KI-Nutzung mit geschätzt 7,2 % weniger Stabilität der Auslieferung einher. Das Ergebnis zeigt eine Korrelation.'),
      fix: l('Use canary releases, feature flags and monitoring to detect production failures and limit their effect.', 'Verwende Canary Releases, Feature Flags und Monitoring. Sie helfen, Produktionsfehler zu erkennen und ihre Folgen zu begrenzen.'), practices: ['canarying', 'feature-flags', 'monitoring'] },
    { src: 'gloaguen2026', claim: l('Cost and effect of written rules', 'Kosten und Wirkung schriftlicher Regeln'),
      text: l('In a study of several coding agents, context files such as AGENTS.md did not increase task success. Inference cost increased by more than 20%.', 'In einer Studie mit mehreren Coding-Agenten erhöhten Dateien wie AGENTS.md die Erfolgsquote nicht. Die Inference-Kosten stiegen um mehr als 20 %.'),
      fix: l('Use automatic checks for rules that a tool can check. Use evals to measure the effect of the other rules.', 'Nutze automatische Checks für Regeln, die ein Tool prüfen kann. Miss die Wirkung der übrigen Regeln mit Evals.'), practices: ['agent-rules', 'evals'] },
  ],
  outro: l(
    'Start with the checks that give fast results. Then use tests and production checks for the other failure types. A person reviews the change for problems that the automatic checks cannot find.',
    'Beginne mit Checks, die schnell Ergebnisse liefern. Verwende weitere Tests und Produktionschecks für andere Fehlerarten. Lass eine Person die Änderung prüfen.',
  ),
};
