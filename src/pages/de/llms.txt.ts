import type { APIRoute } from 'astro';
import { PRACTICES } from '../../data/practices';
import { LAYERS, LANGS } from '../../data/taxonomy';
import { GUIDES } from '../../data/guides';
import { SITE_URL } from '../../lib/site';

/** German counterpart of /llms.txt. Same pages, German names and descriptions. */
export const GET: APIRoute = () => {
  const out = [
    '# Verifizieren lernen',
    '',
    `> Wie man Software verifiziert, besonders wenn Coding-Agenten sie schreiben. ${PRACTICES.length} Praktiken entlang eines Trichters von günstigen, automatischen Checks (Codebasis, Types, Lint, Tests) bis zu teuren (Formal Verification, Production-Praktiken, menschliches Review), mit Open-Source-Werkzeugen je Programmiersprache, Evidence-Bewertungen mit Quellen und fertigen Agent-Aufgaben. Auf Deutsch (/de/) und Englisch (/en/).`,
    '',
    'Jede Seite hat eine Markdown-Version: `index.md` an die URL anhängen. Praxisseiten beginnen mit einem YAML-Header (id, layer, phases, cost, feedback, evidence, related, Sprachzwilling). Jede Praxisseite enthält: eine kurze Einführung mit einem konkreten Problem, eine Ein-Satz-Definition, die gefundene Fehlerklasse, Trichterschicht und Lebenszyklus-Phase, wann sich der Aufwand lohnt, Grenzen, was sich ändert, wenn Agenten den Code schreiben, Evidence (allgemein / KI-spezifisch), Werkzeuge je Sprache, Beispielcode, Einrichtungsschritte, eine Definition von „fertig“ und eine fertige Agent-Aufgabe.',
    '',
    '## Welche Seite für welche Frage',
    `- Neu hier: [Getting Started](${SITE_URL}/de/start/index.md)`,
    `- Ein konkretes Problem im eigenen Projekt: [Mein Projekt diagnostizieren](${SITE_URL}/de/diagnose/index.md)`,
    `- Die Art des Fehlers ist bekannt, der passende Check fehlt: Die Praxisliste unten ist nach Trichterschicht geordnet; die [Lifecycle-Karte](${SITE_URL}/de/lifecycle/index.md) ordnet sie nach Phase`,
    `- Ein Werkzeug für die eigene Sprache: [Werkzeuge nach Sprache](${SITE_URL}/de/stack/index.md)`,
    `- Eine Aufgabe für den eigenen Agenten: der letzte Abschnitt jeder Praxisseite („Aufgabe für den Agenten“)`,
    `- Praktiken nach Kosten, Feedback-Zeit, Evidence oder Werkzeug filtern: [practices.json](${SITE_URL}/practices.json) (zweisprachig); alle Seiten stehen in [sitemap.xml](${SITE_URL}/sitemap.xml)`,
    '',
    `Volltext aller deutschen Praktiken in einer großen Datei (etwa 300 KB): ${SITE_URL}/llms-full-de.txt. Je Trichterschicht gibt es kleinere Dateien, sie sind unten bei der jeweiligen Schicht verlinkt.`,
    '',
    '## Übersichtsseiten',
    `- [Startseite: der Trichter mit allen Praktiken](${SITE_URL}/de/index.md)`,
    `- [Lifecycle-Karte](${SITE_URL}/de/lifecycle/index.md): Praktiken nach Phase, von vor der Produktion bis nach dem Release`,
    `- [Glossar](${SITE_URL}/de/glossary/index.md): Definitionen der verwendeten Begriffe`,
    `- [Einstiegsanleitungen](${SITE_URL}/de/guides/index.md)`,
    `- [Werkzeuge nach Sprache](${SITE_URL}/de/stack/index.md)`,
    `- [Das Petstore-Beispiel](${SITE_URL}/de/petstore/index.md): das durchgehende Beispiel an einem Ort (Daten, Operationen, Regeln wie „ein Tier darf nie doppelt reserviert werden“, Systemteile) und die Praktiken, die jeden Teil prüfen`,
    `- [Über die Seite, Quellen und Selbstverifikation](${SITE_URL}/de/about/index.md)`,
    `- [Referenzen](${SITE_URL}/de/references/index.md): Vorträge und Artikel aus der Praxis, auf denen diese Seite aufbaut (keine Evidence; die Evidence-Bewertungen nutzen die Studien auf der About-Seite)`,
    '',
    '## Start',
    `- [Getting Started](${SITE_URL}/de/start/index.md): geführte Tour in acht Schritten am gemeinsamen Petstore-Beispiel, etwa 60–90 Minuten`,
    `- [Mein Projekt diagnostizieren](${SITE_URL}/de/diagnose/index.md): einen ersten Check für das eigene Projekt wählen, eine Übung ausprobieren und eine Feedback-Loop-Aufgabe für den Agenten kopieren`,
    `- [Warum eine Schicht mit Agenten nicht reicht](${SITE_URL}/de/why-layers/index.md): Forschung zu grünen Tests vs. korrektem Code`,
    ...GUIDES.map((g) => `- [${g.title.de}](${SITE_URL}/de/guides/${g.id}/index.md)`),
    '',
    '## Werkzeuge nach Sprache',
    ...LANGS.map((lg) => `- [${lg.name}](${SITE_URL}/de/stack/${lg.id}/index.md)`),
    '',
  ];
  for (const layer of LAYERS) {
    out.push(`## Praktiken: ${layer.name.de} (${layer.examples.de})`, `Volltext dieser Schicht: ${SITE_URL}/llms-full/de/${layer.id}.txt`);
    for (const p of PRACTICES.filter((x) => x.layer === layer.id)) out.push(`- [${p.name.de}](${SITE_URL}/de/practices/${p.id}/index.md): ${p.oneLiner.de}`);
    out.push('');
  }
  out.push('## Optional', `- [English version](${SITE_URL}/en/)`, `- [Über die Seite und Selbstverifikation](${SITE_URL}/de/about/index.md)`);
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
