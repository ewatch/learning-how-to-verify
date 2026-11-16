import { GLOSSARY, type Term } from '../data/glossary';
import type { Locale } from '../data/types';
import { esc, inline } from './inline';

const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const hasMarks = (s: string) => /[()/]/.test(s);

/** Surface forms (in `lang`) that link to a term. Display strings with parentheses or slashes need explicit aliases. */
export function formsOf(t: Term, lang: Locale): string[] {
  if (t.autolink === false) return [];
  const forms = [...(t.aliases?.[lang] ?? [])];
  if (!hasMarks(t.term[lang])) forms.push(t.term[lang]);
  return [...new Set(forms.map((f) => f.trim()).filter(Boolean))];
}

interface Matcher { re: RegExp; byForm: Map<string, Term> }
const cache = new Map<Locale, Matcher>();

function matcher(lang: Locale): Matcher {
  let m = cache.get(lang);
  if (m) return m;
  const byForm = new Map<string, Term>();
  for (const t of GLOSSARY) for (const f of formsOf(t, lang)) if (!byForm.has(f.toLowerCase())) byForm.set(f.toLowerCase(), t);
  // longest first so "loop invariant" wins over "invariant"
  const alts = [...byForm.keys()].sort((a, b) => b.length - a.length).map(reEsc);
  // whole word: no letter/digit/underscore/entity-marker before, none after, and no "-letter" continuation (e.g. "mutant-killing")
  const re = new RegExp(`(?<![\\p{L}\\p{N}_&#-])(?:${alts.join('|')})(?![\\p{L}\\p{N}_]|-\\p{L})`, 'giu');
  m = { re, byForm };
  cache.set(lang, m);
  return m;
}

/** Link markup for one occurrence. Works as a plain link; /js/gloss enhances it into a popover. */
function mark(t: Term, lang: Locale, shown: string): string {
  return `<a class="gloss" href="/${lang}/glossary/#${t.id}" data-gloss="${esc(t.id)}" data-term="${esc(t.term[lang])}" data-def="${esc(t.def[lang])}">${shown}</a>`;
}

/**
 * Like inline(), but also wraps the first occurrence (per `seen` set, i.e. per page) of each glossary term.
 * Text inside <code> is never touched. `seen` is mutated.
 */
export function inlineGloss(text: string, lang: Locale, seen: Set<string>): string {
  const { re, byForm } = matcher(lang);
  return inline(text).split(/(<code>.*?<\/code>)/s).map((part) => {
    if (part.startsWith('<code>')) return part;
    return part.replace(re, (hit) => {
      const t = byForm.get(hit.toLowerCase());
      if (!t || seen.has(t.id)) return hit;
      seen.add(t.id);
      return mark(t, lang, hit);
    });
  }).join('');
}

/** Convenience for a page: one shared `seen` set. */
export function glosser(lang: Locale) {
  const seen = new Set<string>();
  return (text: string) => inlineGloss(text, lang, seen);
}
