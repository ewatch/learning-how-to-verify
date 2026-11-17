import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { REFERENCES, REFERENCES_COPY } from '../../src/data/references';
import { PRACTICE_BY_ID } from '../../src/data/practices';
import { SOURCES } from '../../src/data/sources';
import { referencesMarkdown } from '../../src/lib/page-markdown';
import type { L } from '../../src/data/types';

const filled = (x: L, where: string) => {
  expect(x.en.trim(), `${where} (en)`).not.toBe('');
  expect(x.de.trim(), `${where} (de)`).not.toBe('');
};

/** A path after /{lang}/ ('' = home, optional #anchor) must match a page in src/pages/[lang]/. */
const pageExists = (path: string) => {
  const dir = path.replace(/#.*$/, '').replace(/\/$/, '');
  const root = 'src/pages/[lang]';
  if (dir === '') return existsSync(`${root}/index.astro`);
  return existsSync(`${root}/${dir}.astro`) || existsSync(`${root}/${dir}/index.astro`);
};

describe('references', () => {
  it('has entries with unique anchor ids', () => {
    expect(REFERENCES.length).toBeGreaterThan(0);
    const ids = REFERENCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  for (const r of REFERENCES) {
    describe(r.id, () => {
      it('has text in both languages', () => {
        expect(r.title.trim()).not.toBe('');
        expect(r.author.trim()).not.toBe('');
        filled(r.venue, `${r.id}.venue`);
        filled(r.about, `${r.id}.about`);
        (r.points ?? []).forEach((p, i) => filled(p, `${r.id}.points[${i}]`));
        r.pages.forEach((p, i) => filled(p.label, `${r.id}.pages[${i}].label`));
      });
      it('has an https URL and a valid date if any', () => {
        expect(new URL(r.url).protocol).toBe('https:');
        if (r.date) {
          expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(Number.isNaN(Date.parse(r.date))).toBe(false);
        }
      });
      it('links only to existing practices and pages', () => {
        expect(r.practices.length + r.pages.length, 'at least one related link').toBeGreaterThan(0);
        for (const id of r.practices) expect(PRACTICE_BY_ID.has(id), id).toBe(true);
        for (const p of r.pages) expect(pageExists(p.path), p.path || 'home').toBe(true);
      });
    });
  }

  it('keeps practitioner references apart from the evidence sources', () => {
    const urls = new Set(SOURCES.map((s) => s.url));
    for (const r of REFERENCES) expect(urls.has(r.url), r.id).toBe(false);
  });

  it('page copy is bilingual', () => {
    const walk = (o: object, where: string): void => {
      for (const [k, v] of Object.entries(o)) {
        if ('en' in v && 'de' in v) filled(v as L, `${where}.${k}`);
        else walk(v, `${where}.${k}`);
      }
    };
    walk(REFERENCES_COPY, 'REFERENCES_COPY');
  });

  it('Markdown twin lists every reference with its URL in both languages', () => {
    for (const loc of ['en', 'de'] as const) {
      const md = referencesMarkdown(loc);
      for (const r of REFERENCES) expect(md, `${loc} ${r.id}`).toContain(r.url);
    }
  });
});
