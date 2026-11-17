import { describe, it, expect } from 'vitest';
import { GET as llmsEn } from '../../src/pages/llms.txt';
import { GET as llmsDe } from '../../src/pages/de/llms.txt';
import { GET as practicesJson } from '../../src/pages/practices.json';
import { PRACTICES } from '../../src/data/practices';

const text = async (r: Response | Promise<Response>) => (await r).text();
const mdPaths = (s: string, loc: string) => [...s.matchAll(new RegExp(`/${loc}/([^)\\s]*index\\.md)`, 'g'))].map((m) => m[1]).sort();
const call = (f: unknown) => (f as () => Response)();

describe('llms.txt in both languages', () => {
  it('lists the same Markdown pages', async () => {
    const [en, de] = [await text(call(llmsEn)), await text(call(llmsDe))];
    expect(mdPaths(de, 'de')).toEqual(mdPaths(en, 'en'));
  });
  it('German index is German and links the per-layer files', async () => {
    const de = await text(call(llmsDe));
    expect(de).toContain('## Welche Seite für welche Frage');
    expect(de).toContain('/llms-full/de/static.txt');
    expect(de).not.toContain('/en/practices/');
  });
  it('English index has the question router and the structured index', async () => {
    const en = await text(call(llmsEn));
    expect(en).toContain('## Which page for which question');
    expect(en).toContain('/practices.json');
  });
});

describe('practices.json', () => {
  it('has one complete entry per practice', async () => {
    const j = JSON.parse(await text(call(practicesJson)));
    expect(j.practices.map((p: { id: string }) => p.id)).toEqual(PRACTICES.map((p) => p.id));
    for (const p of j.practices) {
      expect(p.name.en && p.name.de && p.url.de && p.markdown.en, p.id).toBeTruthy();
      expect(['cheap', 'medium', 'expensive']).toContain(p.cost);
      for (const tools of Object.values(p.tools) as { license: string }[][]) for (const t of tools) expect(t.license, p.id).toBeTruthy();
    }
  });
});
