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
