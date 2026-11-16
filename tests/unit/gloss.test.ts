import { describe, it, expect } from 'vitest';
import { inlineGloss } from '../../src/lib/gloss';
import { GLOSSARY } from '../../src/data/glossary';

const run = (s: string, lang: 'en' | 'de' = 'en', seen = new Set<string>()) => inlineGloss(s, lang, seen);
const count = (html: string) => (html.match(/class="gloss"/g) ?? []).length;

describe('inlineGloss', () => {
  it('links only the first occurrence per page (shared seen set)', () => {
    const seen = new Set<string>();
    const a = run('A mutant survives. Another mutant too.', 'en', seen);
    expect(count(a)).toBe(1);
    expect(a).toContain('href="/en/glossary/#mutant"');
    expect(count(run('More mutants here.', 'en', seen))).toBe(0);
  });
  it('is case-insensitive and keeps the original casing', () => {
    const h = run('Invariants hold.');
    expect(h).toContain('>Invariants</a>');
  });
  it('matches whole words only', () => {
    expect(count(run('It behaves invariantly.'))).toBe(0);
    expect(count(run('The preinvariant is odd.'))).toBe(0);
    expect(count(run('A mutant-killing test.'))).toBe(0);
    expect(count(run('An invariant, here.'))).toBe(1);
  });
  it('prefers the longest match', () => {
    const h = run('A loop invariant helps.');
    expect(h).toContain('#loop-invariant');
    expect(h).not.toContain('#invariant"');
  });
  it('never links inside <code>', () => {
    const h = run('Use `mutant` here, then a mutant.');
    expect(h).toContain('<code>mutant</code>');
    expect(count(h)).toBe(1);
    expect(h.indexOf('<code>')).toBeLessThan(h.indexOf('class="gloss"'));
  });
  it('keeps HTML escaped', () => {
    const h = run('<img src=x onerror=alert(1)> & a "mutant"');
    expect(h).not.toContain('<img');
    expect(h).toContain('&lt;img');
    expect(h).toContain('&amp;');
    expect(count(h)).toBe(1);
  });
  it('escapes definitions in attributes', () => {
    const h = run('A flaky test.');
    expect(h).toMatch(/data-def="[^"<>]*"/);
  });
  it('handles terms with parentheses or slashes through aliases', () => {
    expect(run('The oracle decides.')).toContain('#oracle');
    expect(run('Watch p99 latency.')).toContain('#p95');
    expect(run('Run SAST in CI.')).toContain('#sast');
    expect(run('Flaky tests hurt.')).toContain('#flaky');
    expect(run('An SMT solver proves it.')).toContain('#smt');
  });
  it('does not auto-link generic terms', () => {
    expect(count(run('This property of the agent holds.'))).toBe(0);
    expect(run('A coding agent edits.')).toContain('#agent');
  });
  it('uses the page language terms', () => {
    const de = run('Invarianten und Mutanten, der Orakel.', 'de');
    expect(de).toContain('href="/de/glossary/#invariant"');
    expect(de).toContain('#mutant');
    expect(de).toContain('#oracle');
    expect(count(run('Invarianten gelten.', 'en'))).toBe(0);
    expect(count(run('Mutants die.', 'de'))).toBe(0);
  });
  it('has no alias collisions that map one form to two terms', () => {
    for (const lang of ['en', 'de'] as const) {
      const seen = new Map<string, string>();
      for (const t of GLOSSARY) for (const f of [...(t.aliases?.[lang] ?? [])]) {
        const k = f.toLowerCase();
        expect(seen.get(k) ?? t.id, `${lang}:${f}`).toBe(t.id);
        seen.set(k, t.id);
      }
    }
  });
});
