import { describe, it, expect } from 'vitest';
import { IN_USE } from '../../src/data/in-use';
import { SOURCE_BY_ID } from '../../src/data/sources';
import { PRACTICE_BY_ID } from '../../src/data/practices';
import { practiceMarkdown } from '../../src/lib/markdown';

describe('"In practice" evidence', () => {
  const all = Object.entries(IN_USE).flatMap(([id, list]) => list.map((f) => ({ id, f })));
  it('belongs to existing practices and cites verified sources from the registry', () => {
    for (const id of Object.keys(IN_USE)) expect(PRACTICE_BY_ID.has(id), id).toBe(true);
    for (const { id, f } of all) { const s = SOURCE_BY_ID.get(f.src); expect(s, `${id}: ${f.src}`).toBeDefined(); expect(s!.verified).toBe(true); }
  });
  it('is written in both languages, and German is not a copy of English', () => {
    for (const { id, f } of all) { expect(f.text.en.length, id).toBeGreaterThan(40); expect(f.text.de, id).not.toBe(f.text.en); }
  });
  it('shows up in the Markdown with its kind and citation', () => {
    const md = practiceMarkdown(PRACTICE_BY_ID.get('canarying')!, 'en');
    expect(md).toContain('### In practice');
    expect(md).toContain('**Case:**');
    expect(md).toContain('https://sre.google/workbook/canarying-releases/');
    expect(practiceMarkdown(PRACTICE_BY_ID.get('canarying')!, 'de')).toContain('### In der Praxis');
  });
});
