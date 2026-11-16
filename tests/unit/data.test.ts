import { describe, expect, it } from 'vitest';
import { PRACTICES, PRACTICE_BY_ID } from '../../src/data/practices';
import { SOURCE_BY_ID } from '../../src/data/sources';
import { TOOL_BY_ID, TOOLS } from '../../src/data/tools';
import { GUIDES } from '../../src/data/guides';
import type { L } from '../../src/data/types';

const filled = (x: L, where: string) => {
  expect(x.en.trim(), `${where} (en)`).not.toBe('');
  expect(x.de.trim(), `${where} (de)`).not.toBe('');
};

describe('practice data', () => {
  it('has 56 practices with unique ids', () => {
    expect(PRACTICES).toHaveLength(56);
    expect(PRACTICE_BY_ID.size).toBe(56);
  });

  it('every practice has enough think-first questions, benefits, limits and steps', () => {
    for (const p of PRACTICES) {
      expect(p.think.length, `${p.id} think-first questions`).toBeGreaterThanOrEqual(2);
      expect(p.worth.length, `${p.id} worth`).toBeGreaterThanOrEqual(3);
      expect(p.limits.length, `${p.id} limits`).toBeGreaterThanOrEqual(2);
      expect(p.steps.length, `${p.id} steps`).toBeGreaterThanOrEqual(3);
    }
  });

  for (const p of PRACTICES) {
    describe(p.id, () => {
      it('is complete in both languages', () => {
        for (const k of ['name', 'oneLiner', 'catches', 'ai', 'done'] as const) filled(p[k], `${p.id}.${k}`);
        expect(p.worth.length).toBeGreaterThan(0);
        expect(p.limits.length).toBeGreaterThan(0);
        expect(p.steps.length).toBeGreaterThan(0);
        expect(p.think.length).toBeGreaterThan(0);
        [...p.worth, ...p.limits, ...p.steps].forEach((x, i) => filled(x, `${p.id}[${i}]`));
        p.think.forEach((t, i) => { filled(t.q, `${p.id}.think${i}.q`); filled(t.a, `${p.id}.think${i}.a`); });
      });
      it('has valid focus annotations on snippets', () => {
        for (const [si, s] of (p.snippets ?? []).entries()) {
          if (!s.focus) continue;
          const n = s.code.split('\n').length;
          const where = `${p.id} snippet ${si}`;
          expect(s.focus.length, where).toBeGreaterThan(0);
          expect(s.focus.length, `${where} max 5`).toBeLessThanOrEqual(5);
          for (const f of s.focus) {
            const [a, b] = Array.isArray(f.line) ? f.line : [f.line, f.line];
            expect(Number.isInteger(a) && Number.isInteger(b), `${where} integer`).toBe(true);
            expect(a, `${where} line ${a}`).toBeGreaterThanOrEqual(1);
            expect(b, `${where} range ${a}-${b}`).toBeGreaterThanOrEqual(a);
            expect(b, `${where} line ${b} <= ${n}`).toBeLessThanOrEqual(n);
            filled(f.note, `${where} focus note`);
            const lines = s.code.split('\n');
            for (const ln of [a]) { // closing brackets are fine as the end of a range
              expect(/^\s*(?:[{}()[\]]|\)|\}\)|\]\)|\}\);|\);|\],?|\},?)?\s*$/.test(lines[ln - 1] ?? ''), `${where} line ${ln} is blank or only brackets`).toBe(false);
            }
          }
        }
      });
      it('references only known practices, tools, sources and guides', () => {
        for (const r of p.related) expect(PRACTICE_BY_ID.has(r), `related ${r}`).toBe(true);
        for (const ids of Object.values(p.tools)) for (const t of ids!) expect(TOOL_BY_ID.has(t), `tool ${t}`).toBe(true);
        for (const e of [p.evidence.general, p.evidence.ai]) {
          if (e.rating === 'none') expect(e.findings).toHaveLength(0);
          else expect(e.findings.length, 'rated evidence needs a finding').toBeGreaterThan(0);
          for (const fi of e.findings) {
            const s = SOURCE_BY_ID.get(fi.src);
            expect(s, `source ${fi.src}`).toBeDefined();
            expect(s!.verified, `source ${fi.src} verified`).toBe(true);
            filled(fi.text, `${p.id} finding ${fi.src}`);
          }
        }
        for (const g of p.guides ?? []) expect(GUIDES.some((x) => x.id === g), `guide ${g}`).toBe(true);
      });
    });
  }

  it('every tool has a license and an https repo, and tool ids are unique', () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      expect(t.license, t.id).toMatch(/\S/);
      expect(t.repo, t.id).toMatch(/^https:\/\//);
      expect(t.url, t.id).toMatch(/^https:\/\//);
    }
  });
});
