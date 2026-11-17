import { describe, it, expect } from 'vitest';
import { PRACTICES } from '../../src/data/practices';
import { practiceMarkdown } from '../../src/lib/markdown';
import { sitemapPaths } from '../../src/pages/sitemap.xml';

const frontmatter = (md: string) => {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  return m ? Object.fromEntries(m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()])) : null;
};

describe('practice Markdown twin', () => {
  for (const loc of ['en', 'de'] as const) {
    it(`${loc}: every practice has complete frontmatter, an agent task and only resolvable links`, () => {
      const known = new Set(sitemapPaths().map((x) => `/${loc}/${x}index.md`));
      for (const p of PRACTICES) {
        const md = practiceMarkdown(p, loc, { twin: true });
        const fm = frontmatter(md);
        expect(fm, p.id).not.toBeNull();
        for (const k of ['id', 'title', 'lang', 'canonical', 'markdown', 'layer', 'phases', 'cost', 'feedback', 'evidence_general', 'evidence_ai', 'related']) expect(fm![k], `${p.id}.${k}`).toBeTruthy();
        expect(fm!.id).toBe(p.id);
        expect(fm!.lang).toBe(loc);
        expect(md).toContain('````markdown');
        for (const m of md.matchAll(/\]\(https?:\/\/[^)\s]*?(\/(?:en|de)\/[^)\s]*index\.md)\)/g)) expect(known.has(m[1]), `${p.id}: ${m[1]}`).toBe(true);
      }
    });
  }

  it('the plain output (llms-full files, Socratic prompt) has neither frontmatter nor agent task', () => {
    const md = practiceMarkdown(PRACTICES[0], 'en');
    expect(md.startsWith('# ')).toBe(true);
    expect(md).not.toContain('````markdown');
  });
});
