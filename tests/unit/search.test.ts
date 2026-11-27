import { describe, it, expect } from 'vitest';
import { buildSearchIndex } from '../../src/lib/search-index';
import { searchDocs, highlightText } from '../../src/lib/search-core';
import { PRACTICES, PRACTICE_BY_ID } from '../../src/data/practices';
import { GLOSSARY } from '../../src/data/glossary';
import { GUIDES } from '../../src/data/guides';
import { LANGS } from '../../src/data/taxonomy';

describe('site search', () => {
  for (const lang of ['en', 'de'] as const) {
    const docs = buildSearchIndex(lang);

    it(`${lang}: indexes all practices, glossary terms, guides, stack pages and overview pages`, () => {
      expect(docs.filter((d) => d.kind === 'practice')).toHaveLength(PRACTICES.length);
      expect(docs.filter((d) => d.kind === 'glossary')).toHaveLength(GLOSSARY.length);
      expect(docs.filter((d) => d.kind === 'guide')).toHaveLength(GUIDES.length);
      expect(docs.filter((d) => d.kind === 'stack')).toHaveLength(LANGS.length);
      expect(docs.filter((d) => d.kind === 'page').length).toBeGreaterThanOrEqual(10);
      for (const d of docs) {
        expect(d.title.trim()).not.toBe('');
        expect(d.url.startsWith(`/${lang}/`)).toBe(true);
      }
    });

    it(`${lang}: finds CODEOWNERS and Branch Protection in test-integrity and glossary`, () => {
      const hits = searchDocs(docs, 'CODEOWNERS');
      const ids = hits.map((h) => h.doc.id);
      expect(ids).toContain('practice:test-integrity');
      expect(ids).toContain('glossary:codeowners');
      expect(hits[0].excerpt.toLowerCase()).toContain('codeowners');

      const bpHits = searchDocs(docs, 'branch protection');
      expect(bpHits.map((h) => h.doc.id)).toContain('practice:test-integrity');
      expect(bpHits.map((h) => h.doc.id)).toContain('glossary:codeowners');
    });

    it(`${lang}: ranks short queries like "ci" accurately ahead of mid-word substrings`, () => {
      const hits = searchDocs(docs, 'ci');
      expect(hits[0].doc.id).toBe('practice:ci');
      expect(hits.some((h) => h.doc.id === 'practice:tracing' && h.score >= hits[0].score)).toBe(false);
    });

    it(`${lang}: finds practices by tool name, config file, enforcer and evidence`, () => {
      expect(searchDocs(docs, 'StrykerJS')[0].doc.id).toBe('practice:mutation-tests');
      expect(searchDocs(docs, 'AGENTS.md')[0].doc.id).toBe('practice:agent-rules');
      expect(searchDocs(docs, 'Conftest').some((h) => h.doc.id === 'practice:config-tests')).toBe(true);
      expect(searchDocs(docs, 'TLA+').some((h) => h.doc.id === 'guide:tla')).toBe(true);
      expect(searchDocs(docs, 'Gandalf').some((h) => h.doc.id === 'practice:canarying')).toBe(true);
    });

    it(`${lang}: supports category filtering`, () => {
      const glossOnly = searchDocs(docs, 'CODEOWNERS', { filter: 'glossary' });
      expect(glossOnly.length).toBeGreaterThan(0);
      expect(glossOnly.every((h) => h.doc.kind === 'glossary')).toBe(true);
      const pracOnly = searchDocs(docs, 'CODEOWNERS', { filter: 'practice' });
      expect(pracOnly.length).toBeGreaterThan(0);
      expect(pracOnly.every((h) => h.doc.kind === 'practice')).toBe(true);
    });
  }

  it('matches German umlauts and ß insensitively', () => {
    const deDocs = buildSearchIndex('de');
    const hits = searchDocs(deDocs, 'ubung');
    expect(hits.length).toBeGreaterThan(0);
    const highlighted = highlightText('Übung für Maßnahme', ['ubung', 'massnahme']);
    expect(highlighted).toContain('<mark>Übung</mark>');
    expect(highlighted).toContain('<mark>Maßnahme</mark>');
  });

  it('escapes HTML safely in highlightText', () => {
    const out = highlightText('<script>alert("CODEOWNERS")</script>', ['codeowners']);
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
    expect(out).toContain('<mark>CODEOWNERS</mark>');
  });

  it('enforcedBy is bilingual wherever defined, and present on key declarative rule files', () => {
    for (const p of PRACTICES) {
      for (const [i, s] of (p.snippets ?? []).entries()) {
        if (!s.enforcedBy) continue;
        expect(s.enforcedBy.en.trim(), `${p.id} snippet ${i} enforcedBy.en`).toBeTruthy();
        expect(s.enforcedBy.de.trim(), `${p.id} snippet ${i} enforcedBy.de`).toBeTruthy();
      }
    }
    for (const id of ['test-integrity', 'ci', 'security-scanning', 'agent-rules', 'config-tests', 'acceptance-tests']) {
      const p = PRACTICE_BY_ID.get(id)!;
      expect((p.snippets ?? []).some((s) => Boolean(s.enforcedBy)), id).toBe(true);
    }
  });
});
