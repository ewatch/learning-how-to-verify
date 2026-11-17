import type { LangId, Locale, Practice } from '../data/types';
import { LANGS, ANY_LANG, LAYERS, PHASES } from '../data/taxonomy';
import { TOOL_BY_ID } from '../data/tools';
import { SITE_URL } from './site';

export const langName = (id: LangId) => (LANGS.find((x) => x.id === id) ?? ANY_LANG).name;

export function toolsFor(p: Practice, lang: LangId) {
  const own = lang === 'any' ? [] : (p.tools[lang] ?? []);
  const any = p.tools.any ?? [];
  return {
    own: own.map((id) => TOOL_BY_ID.get(id)!),
    any: any.filter((id) => !own.includes(id)).map((id) => TOOL_BY_ID.get(id)!),
  };
}

export function snippetFor(p: Practice, lang: LangId) {
  const s = p.snippets ?? [];
  return s.find((x) => x.lang === lang) ?? s.find((x) => x.lang === 'any') ?? null;
}

const pageUrl = (p: Practice, loc: Locale) => `${SITE_URL}/${loc}/practices/${p.id}/`;

/** "Copy for your agent": an instruction, not marketing. Always in the page language. */
export function agentPrompt(p: Practice, loc: Locale, lang: LangId, allLanguages = false): string {
  const { own, any } = toolsFor(p, lang);
  // Markdown twin: no language chosen, so list the tools of every language and let the agent match the project
  const tools = allLanguages
    ? [...new Map(Object.values(p.tools).flat().map((id) => [id, TOOL_BY_ID.get(id)!])).values()]
    : [...own, ...any];
  const stack = allLanguages ? (loc === 'de' ? 'wie im Projekt vorhanden' : 'as used in the project') : langName(lang);
  const de = loc === 'de';
  const toolLine = tools.length
    ? tools.map((x) => `${x.name} (${x.license}, ${x.url})`).join('; ')
    : de ? 'keine speziellen Werkzeuge nötig' : 'no special tools needed';
  const lines = [
    de ? `# Aufgabe: ${p.name.de} in diesem Repository einrichten` : `# Task: set up ${p.name.en} in this repository`,
    '',
    de ? `Kontext: ${p.oneLiner.de} Es findet: ${p.catches.de}.` : `Context: ${p.oneLiner.en} It catches: ${p.catches.en}.`,
    de ? `Sprache/Stack: ${stack}. Bevorzugte Open-Source-Werkzeuge: ${toolLine}. Nimm das, was zum vorhandenen Setup passt; frag nach, bevor du ein neues Framework einführst.`
       : `Language/stack: ${stack}. Preferred open-source tools: ${toolLine}. Use whichever fits the existing setup; ask before introducing a new framework.`,
    '',
    de ? '## Schritte' : '## Steps',
    ...p.steps.map((s, i) => `${i + 1}. ${s[loc]}`),
    '',
    de ? '## Regeln' : '## Rules',
    de ? '- Bestehende Tests nicht abschwächen, überspringen oder löschen.' : '- Do not weaken, skip or delete existing tests.',
    de ? '- Kleine Commits; nach jedem Schritt den Prüfbefehl des Projekts ausführen.' : "- Small commits; run the project's verify command after each step.",
    de ? '- Wenn etwas unklar ist oder eine Entscheidung nötig ist: anhalten und fragen.' : '- If something is unclear or needs a decision: stop and ask.',
    '',
    de ? '## Fertig, wenn' : '## Done when',
    p.done[loc],
    '',
    de ? '## Bericht' : '## Report',
    de ? 'Liste die geänderten Dateien, die ausgeführten Befehle mit ihrer Ausgabe (gekürzt) und alles, was offen bleibt.' : 'List the files changed, the commands you ran with their (trimmed) output, and anything left open.',
    '',
    de ? `Hintergrund: ${pageUrl(p, loc)} (Markdown: ${pageUrl(p, loc)}index.md)` : `Background: ${pageUrl(p, loc)} (Markdown: ${pageUrl(p, loc)}index.md)`,
  ];
  return lines.join('\n');
}

/** Self-contained Socratic tutor prompt for the reader's own LLM. */
export function socraticPrompt(p: Practice, loc: Locale, lang: LangId, markdown: string): string {
  const de = loc === 'de';
  const head = de
    ? `Du bist ein sokratischer Tutor für Softwareverifikation. Ich möchte „${p.name.de}“ wirklich verstehen. Antworte auf Deutsch.

So arbeitest du:
- Stell mir jeweils genau eine Frage und warte auf meine Antwort. Erkläre nicht vorab.
- Beginne damit, herauszufinden, was ich schon weiß.
- Wenn ich falsch liege, sag nicht die Lösung, sondern stell eine Frage, die mich den Widerspruch selbst finden lässt.
- Nutze das Beispiel unten (Tier-Reservierung im Petstore; ein Tier darf nie doppelt reserviert werden) und, wenn passend, meine Sprache: ${langName(lang)}.
- Lass mich zwischendurch kleine Code-Stücke schreiben oder Ergebnisse vorhersagen.
- Nach etwa 8–10 Fragen: fasse zusammen, was ich verstanden habe und was noch offen ist, und schlage eine kleine Übung in meinem eigenen Projekt vor.

Hier ist das Material, auf das du dich stützen sollst:`
    : `You are a Socratic tutor for software verification. I want to really understand "${p.name.en}".

How you work:
- Ask me exactly one question at a time and wait for my answer. Do not lecture up front.
- Start by finding out what I already know.
- When I am wrong, do not give the answer; ask a question that lets me find the contradiction myself.
- Use the example below (pet reservation in a petstore; a pet must never be reserved twice) and, where it fits, my language: ${langName(lang)}.
- Now and then, have me write a small piece of code or predict a result.
- After about 8–10 questions: summarise what I understood and what is still open, and suggest a small exercise in my own project.

Here is the material to base your questions on:`;
  return `${head}\n\n---\n${markdown}\n---`;
}

export function layerName(p: Practice, loc: Locale) { return LAYERS.find((x) => x.id === p.layer)!.name[loc]; }
export function phaseNames(p: Practice, loc: Locale) { return p.phases.map((id) => PHASES.find((x) => x.id === id)!.name[loc]); }
