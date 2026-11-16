import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { GUIDES } from '../../src/data/guides';
import { guideMarkdown, practiceMarkdown } from '../../src/lib/markdown';
import { PRACTICES } from '../../src/data/practices';
import { homeMarkdown, lifecycleMarkdown, glossaryMarkdown, aboutMarkdown, guidesIndexMarkdown, stackIndexMarkdown } from '../../src/lib/page-markdown';

describe('guides', () => {
  it('install labels are bilingual', () => {
    for (const g of GUIDES) for (const i of g.install) { expect(i.os.en.length).toBeGreaterThan(0); expect(i.os.de.length).toBeGreaterThan(0); }
  });
  it('German Markdown uses the German label', () => {
    const g = GUIDES[0];
    expect(guideMarkdown(g, 'de')).toContain(g.install[0].os.de);
  });
  it('TLA+ guide names AdoptFixed.cfg in both languages', () => {
    const step = GUIDES.find((g) => g.id.includes('tla'))!.steps.find((s) => s.code?.file === 'AdoptFixed.tla')!;
    expect(step.text.en).toContain('AdoptFixed.cfg');
    expect(step.text.de).toContain('AdoptFixed.cfg');
  });
});

describe('think-first labels', () => {
  it('German Markdown says F:, English Q:', () => {
    const p = PRACTICES[0];
    expect(practiceMarkdown(p, 'de')).toContain('**F:**');
    expect(practiceMarkdown(p, 'en')).toContain('**Q:**');
  });
});

describe('Markdown twins', () => {
  const root = 'src/pages/[lang]';
  const twins = [...readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('[') && existsSync(`${root}/${d.name}/index.md.ts`)).map((d) => d.name), ''];
  const llms = readFileSync('src/pages/llms.txt.ts', 'utf8');
  it('every static page twin is listed in llms.txt', () => {
    for (const d of twins) expect(llms, d || 'home').toContain(`/en/${d ? d + '/' : ''}index.md`);
  });
  it('every page with a twin points to it from its layout', () => {
    for (const d of ['lifecycle', 'glossary', 'about']) expect(readFileSync(`${root}/${d}.astro`, 'utf8')).toContain(`/${d}/index.md`);
    for (const d of ['guides', 'stack']) expect(readFileSync(`${root}/${d}/index.astro`, 'utf8')).toContain(`/${d}/index.md`);
    expect(readFileSync(`${root}/index.astro`, 'utf8')).toContain('/index.md');
  });
  it('twins are non-empty in both languages', () => {
    for (const loc of ['en', 'de'] as const)
      for (const f of [homeMarkdown, lifecycleMarkdown, glossaryMarkdown, aboutMarkdown, guidesIndexMarkdown, stackIndexMarkdown]) expect(f(loc).length).toBeGreaterThan(200);
  });
});
