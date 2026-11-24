import type { UseFinding } from './types';

/**
 * "In practice": documented use in industry, for practices with little or no study of their effect.
 * These show that a practice is applied, not that it works better. Keep each text to what the source page says.
 * Sources: src/data/sources.ts only.
 */
const u = (kind: UseFinding['kind'], src: string, en: string, de: string): UseFinding => ({ kind, src, text: { en, de } });

export const IN_USE: Record<string, UseFinding[]> = {
  'threat-modeling': [
    u('standard', 'owasp2021a04',
      'The OWASP Top 10:2021 lists insecure design as category A04 and recommends threat modeling for critical authentication, access control, business logic and key flows.',
      'Die OWASP Top 10:2021 führen unsicheres Design als Kategorie A04 und empfehlen Threat Modeling für kritische Authentifizierung, Zugriffskontrolle, Geschäftslogik und Schlüsselabläufe.'),
  ],
  canarying: [
    u('case', 'sre2018canary',
      'The Google SRE Workbook defines canarying as a partial deployment for a limited time. The rest of the service is the control group. Google reports that binary or configuration changes cause most incidents in its experience.',
      'Das SRE Workbook von Google definiert Canarying als teilweises, zeitlich begrenztes Ausrollen einer Änderung, die mit dem Rest des Dienstes als Kontrollgruppe verglichen wird. Es nennt als Erfahrung bei Google, dass die Mehrheit der Incidents durch Binary- oder Konfigurations-Pushes ausgelöst wird.'),
  ],
  'config-tests': [
    u('case', 'sre2017testing',
      'Google\'s SRE book describes a configuration test for each configuration file. It examines production to see how a binary is actually configured. At Google, configurations are described in files in version control.',
      'Das SRE-Buch von Google beschreibt für jede Konfigurationsdatei einen eigenen Configuration Test, der in Produktion prüft, wie ein Binary tatsächlich konfiguriert ist. Bei Google liegen Konfigurationen als Dateien in der Versionsverwaltung.'),
  ],
  'smoke-tests': [
    u('guidance', 'sre2017testing',
      'Google\'s SRE book describes smoke tests, which check very simple but critical behavior, as among the simplest types of system test.',
      'Das SRE-Buch von Google beschreibt Smoke Tests, die sehr einfaches, aber kritisches Verhalten prüfen, als eine der einfachsten Arten von System Tests.'),
  ],
  'load-tests': [
    u('guidance', 'sre2017testing',
      'Google\'s SRE book names stress tests as the way engineers find the limits of a web service.',
      'Das SRE-Buch von Google nennt Stress Tests als den Weg, die Grenzen eines Webdienstes zu finden.'),
  ],
  'performance-tests': [
    u('guidance', 'sre2017testing',
      'Google\'s SRE book describes a performance test as one that ensures a system does not degrade or become too expensive over time.',
      'Das SRE-Buch von Google beschreibt einen Performance Test als Test, der sicherstellt, dass ein System mit der Zeit nicht langsamer oder zu teuer wird.'),
  ],
  'regression-tests': [
    u('guidance', 'sre2017testing',
      'Google\'s SRE book compares regression tests to a gallery of rogue bugs that historically made the system fail or return wrong results.',
      'Das SRE-Buch von Google vergleicht Regression Tests mit einer Galerie von Bugs, die das System früher scheitern oder falsche Ergebnisse liefern ließen.'),
  ],
  'integration-tests': [
    u('case', 'swe2020overview',
      'Software Engineering at Google gives an approximate mix by test case: 80% unit tests, 15% integration tests and 5% end-to-end tests. The proportions can vary by team.',
      '„Software Engineering at Google“ gibt eine ungefähre Verteilung pro Testfall an. Sie umfasst 80 % Unit Tests, 15 % Integration Tests und 5 % End-to-End Tests. Die Anteile können je nach Team variieren.'),
  ],
  'e2e-tests': [
    u('case', 'swe2020larger',
      '"Software Engineering at Google" says Google uses many larger tests and that they are a significant part of its risk mitigation. It also notes that larger tests are often flakier because they use more infrastructure than a small unit test.',
      '„Software Engineering at Google“ sagt, dass Google viele größere Tests einsetzt und dass sie ein wesentlicher Teil der Risikominderung sind. Es merkt auch an, dass größere Tests oft instabiler (flaky) sind, weil sie mehr Infrastruktur nutzen als ein kleiner Unit Test.'),
  ],
  'chaos-testing': [
    u('case', 'swe2020larger',
      '"Software Engineering at Google" reports that teams at Google run thousands of chaos tests each week with Catzilla, a system built in-house.',
      '„Software Engineering at Google“ berichtet, dass Teams bei Google jede Woche tausende Chaos Tests mit Catzilla durchführen, einem selbst gebauten System.'),
  ],
  'differential-testing': [
    u('case', 'swe2020larger',
      '"Software Engineering at Google" calls A/B diff tests possibly the most common form of larger testing at Google.',
      '„Software Engineering at Google“ nennt A/B Diff Tests möglicherweise die häufigste Form größerer Tests bei Google.'),
  ],
  'tap-compare': [
    u('case', 'toth2016',
      'GitHub\'s Scientist runs the old and the new code path, returns the old result and records any differences. GitHub names a large, multi-year rewrite of its permission code among its uses.',
      'GitHubs Scientist führt den alten und den neuen Codepfad aus, gibt das alte Ergebnis zurück und zeichnet Unterschiede auf. GitHub nennt unter den Einsätzen einen großen, mehrjährigen Umbau seines Berechtigungscodes.'),
  ],
  'agent-rules': [
    u('adoption', 'agentsmd2026',
      'The AGENTS.md website reports that more than 60,000 open-source projects use the format. It says that many coding tools support the format. The Agentic AI Foundation, part of the Linux Foundation, maintains the format.',
      'Laut eigener Website nutzen über 60.000 Open-Source-Projekte das AGENTS.md-Format; viele Coding-Werkzeuge unterstützen es, und die Agentic AI Foundation unter der Linux Foundation betreut es.'),
  ],
  tracing: [
    u('adoption', 'cncfotel2026',
      'The Cloud Native Computing Foundation lists OpenTelemetry as a Graduated project: accepted in 2019, Incubating since 2021, Graduated since 11 May 2026.',
      'Die Cloud Native Computing Foundation führt OpenTelemetry als Graduated-Projekt: 2019 aufgenommen, seit 2021 Incubating, seit dem 11. Mai 2026 Graduated.'),
  ],
  'unit-tests': [
    u('adoption', 'stateofjs2024testing',
      'The State of JavaScript 2024 survey asked about tools that respondents use at work. In the survey, 7,262 respondents named Jest and 3,986 named Vitest. JavaScript developers chose whether to participate.',
      'In der Umfrage State of JavaScript 2024 nannten 7.262 Teilnehmende Jest und 3.986 Vitest unter den Testwerkzeugen, die sie beruflich nutzen. Die Umfrage ist selbst ausgewählt und erfasst JavaScript-Entwickler.'),
  ],
  'contract-tests': [
    u('guidance', 'thoughtworks2016cdc',
      'The Thoughtworks Technology Radar placed consumer-driven contract testing in its Adopt ring in May 2015, November 2015 and November 2016. The entry is no longer on the current edition.',
      'Der Thoughtworks Technology Radar führte Consumer-driven Contract Testing im Mai 2015, November 2015 und November 2016 im Ring Adopt. Der Eintrag steht nicht mehr in der aktuellen Ausgabe.'),
  ],
  'feature-flags': [
    u('adoption', 'cncfopenfeature2023',
      'The CNCF accepted OpenFeature in June 2022. OpenFeature reached the Incubating level on 21 November 2023.',
      'OpenFeature, dessen Leitsatz „Standardizing Feature Flagging for Everyone“ lautet, wurde im Juni 2022 in die CNCF aufgenommen und erreichte am 21. November 2023 die Stufe Incubating.'),
  ],
  'fuzz-tests': [
    u('case', 'ossfuzz2023',
      'As of August 2023, Google\'s OSS-Fuzz had helped identify and fix over 10,000 vulnerabilities and 36,000 bugs across 1,000 projects.',
      'Stand August 2023 hat Googles OSS-Fuzz geholfen, über 10.000 Sicherheitslücken und 36.000 Bugs in 1.000 Projekten zu finden und zu beheben.'),
  ],
  sanitizers: [
    u('case', 'chromiumasan2026',
      'Chromium\'s documentation lists build bots that run the Chromium tests under AddressSanitizer on Linux, macOS and Chromium OS, plus three trybots with ASan.',
      'Die Chromium-Dokumentation nennt Build-Bots, die die Chromium-Tests unter AddressSanitizer auf Linux, macOS und Chromium OS ausführen, dazu drei Trybots mit ASan.'),
  ],
  monitoring: [
    u('guidance', 'sre2017monitoring',
      'The Google SRE book gives four golden signals: latency, traffic, errors and saturation. It recommends an alert when a signal indicates a problem. The alert must give the on-call person an action to take.',
      'Das SRE-Buch von Google nennt vier Golden Signals fürs Monitoring: Latency, Traffic, Errors und Saturation. Wer alle vier misst und einen Menschen alarmiert, wenn eines problematisch ist, deckt einen Dienst mindestens ordentlich ab. Jede Alarmierung solle handlungsrelevant sein.'),
  ],
  'oncall-experience': [
    u('case', 'sre2017oncall',
      'Google\'s SRE book says SREs are on call for the services they support. Assuming week-long shifts, each engineer is on call for one week every month, and many teams have a primary and a secondary rotation.',
      'Das SRE-Buch von Google sagt, dass SREs für die Dienste in Bereitschaft sind, die sie betreuen. Bei wöchentlichen Schichten ist jeder Engineer eine Woche pro Monat in Bereitschaft, und viele Teams haben eine primäre und eine sekundäre Rotation.'),
    u('guidance', 'sre2017oncall',
      'The chapter sets a maximum of two incidents in a 12-hour shift. Too many alerts can cause fatigue. As a result, the on-call person can give too little attention to serious alerts.',
      'Das Kapitel empfiehlt höchstens zwei Incidents pro 12-Stunden-Schicht. Zu viele Alerts können zu Ermüdung führen. Dadurch kann die Rufbereitschaft wichtige Alerts übersehen.'),
  ],
  'penetration-tests': [
    u('guidance', 'nist800115',
      'NIST SP 800-115 gives guidance on planning and conducting technical information security tests and assessments. Its keywords include penetration testing.',
      'NIST SP 800-115 gibt Hinweise, technische Informationssicherheitstests und -bewertungen zu planen und durchzuführen. Penetration Testing gehört zu den Schlagwörtern des Dokuments.'),
  ],
};
