import { describe, expect, it } from 'vitest';
import { PRACTICES } from '../../src/data/practices';
import { PARTS, PART_BY_ID, systemOf } from '../../src/data/petstore';
import { petstoreMarkdown } from '../../src/lib/page-markdown';

const words = (s: string) => s.trim().split(/\s+/).length;

describe('petstore domain model', () => {
  it('has unique part ids with text in both languages', () => {
    expect(PART_BY_ID.size).toBe(PARTS.length);
    for (const p of PARTS) {
      for (const loc of ['en', 'de'] as const) {
        expect(p.name[loc].trim(), `${p.id} name ${loc}`).not.toBe('');
        expect(p.text[loc].trim(), `${p.id} text ${loc}`).not.toBe('');
      }
      expect(words(p.text.en), `${p.id} description has at most 25 words`).toBeLessThanOrEqual(25);
    }
  });

  it('system parts have a zone, other parts do not', () => {
    for (const p of PARTS) expect(p.kind === 'system', p.id).toBe(p.zone !== undefined);
  });

  it('operations name only existing rules', () => {
    for (const p of PARTS) for (const r of p.rules ?? []) {
      expect(p.kind, p.id).toBe('operation');
      expect(PART_BY_ID.get(r)?.kind, `${p.id} → ${r}`).toBe('rule');
    }
  });

  it('every rule belongs to an operation', () => {
    const used = new Set(PARTS.flatMap((p) => p.rules ?? []));
    for (const p of PARTS.filter((x) => x.kind === 'rule')) expect(used.has(p.id), p.id).toBe(true);
  });

  it('data, operations and rules live in the domain code', () => {
    for (const p of PARTS) expect(systemOf(p.id), p.id).toBe(p.kind === 'system' ? p.id : 'domain');
  });
});

describe('practice → petstore mapping', () => {
  it('every practice has a domain entry with known parts and a sentence in both languages', () => {
    for (const p of PRACTICES) {
      expect(p.domain, p.id).toBeDefined();
      expect(p.domain.parts.length, `${p.id} parts`).toBeGreaterThan(0);
      expect(p.domain.parts.length, `${p.id} at most 3 parts`).toBeLessThanOrEqual(3);
      expect(new Set(p.domain.parts).size, `${p.id} unique parts`).toBe(p.domain.parts.length);
      for (const id of p.domain.parts) expect(PART_BY_ID.has(id), `${p.id} → ${id}`).toBe(true);
      for (const loc of ['en', 'de'] as const) {
        expect(p.domain.what[loc].trim(), `${p.id} what ${loc}`).not.toBe('');
        expect(p.domain.what[loc], `${p.id} what ${loc} ends with a full stop or a question mark`).toMatch(/[.?]$/);
      }
      expect(words(p.domain.what.en), `${p.id} what: one short sentence`).toBeLessThanOrEqual(20);
    }
  });

  it('every operation, rule and system part is checked by at least one practice', () => {
    const used = new Set(PRACTICES.flatMap((p) => p.domain.parts));
    for (const p of PARTS.filter((x) => x.kind !== 'data')) expect(used.has(p.id), p.id).toBe(true);
  });

  it('the Markdown twin lists every part and links the practices', () => {
    for (const loc of ['en', 'de'] as const) {
      const md = petstoreMarkdown(loc);
      for (const p of PARTS) expect(md, `${loc} ${p.id}`).toContain(`## ${p.name[loc]}`);
      expect(md).toContain(`/${loc}/practices/unit-tests/index.md`);
    }
  });
});
