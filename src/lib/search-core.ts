import type { LayerId } from '../data/types';
import { esc } from './inline';

export type SearchKind = 'practice' | 'glossary' | 'guide' | 'stack' | 'page';
export type SearchFilter = 'all' | 'practice' | 'glossary' | 'other';

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  title: string;
  url: string;
  summary: string;
  keywords: string;
  body: string;
  layer?: LayerId;
  meta?: string;
}

export interface SearchHit {
  doc: SearchDoc;
  score: number;
  excerpt: string;
  terms: string[];
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function tokenize(query: string): string[] {
  const q = normalize(query).trim();
  if (!q) return [];
  return [...new Set(q.split(/\s+/).filter(Boolean))];
}

const KIND_BOOST: Record<SearchKind, number> = {
  practice: 4,
  guide: 3,
  glossary: 2,
  page: 1,
  stack: 0,
};

function isWordBoundary(ch: string | undefined): boolean {
  return !ch || !/[a-z0-9]/i.test(ch);
}

function fieldMatchScore(
  haystack: string,
  token: string,
  wholeWeight: number,
  startWeight: number,
  subWeight: number,
): number {
  let idx = haystack.indexOf(token);
  if (idx < 0) return 0;
  let best = 0;
  const allowMidWord = token.length > 2;
  while (idx >= 0) {
    const startOk = isWordBoundary(haystack[idx - 1]);
    const endOk = isWordBoundary(haystack[idx + token.length]);
    if (startOk && endOk) return wholeWeight;
    if (startOk) best = Math.max(best, startWeight);
    else if (allowMidWord) best = Math.max(best, subWeight);
    idx = haystack.indexOf(token, idx + 1);
  }
  return best;
}

function matchesFilter(kind: SearchKind, filter: SearchFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'practice') return kind === 'practice';
  if (filter === 'glossary') return kind === 'glossary';
  return kind === 'guide' || kind === 'stack' || kind === 'page';
}

function findMatchIndex(normSrc: string, terms: string[]): number {
  let bestIdx = -1;
  for (const t of terms) {
    let pos = normSrc.indexOf(t);
    while (pos >= 0) {
      if (t.length > 2 || isWordBoundary(normSrc[pos - 1])) {
        if (bestIdx < 0 || pos < bestIdx) bestIdx = pos;
        break;
      }
      pos = normSrc.indexOf(t, pos + 1);
    }
  }
  return bestIdx;
}

function buildExcerpt(doc: SearchDoc, terms: string[]): string {
  const maxLen = 170;
  const clip = (text: string) => (text.length <= maxLen ? text : text.slice(0, maxLen - 1).trimEnd() + '…');
  if (findMatchIndex(normalize(doc.summary), terms) >= 0) return clip(doc.summary);

  for (const source of [doc.body, doc.keywords]) {
    if (!source) continue;
    const normSrc = normalize(source);
    const bestIdx = findMatchIndex(normSrc, terms);
    if (bestIdx < 0) continue;

    const ratio = source.length / Math.max(1, normSrc.length);
    const approx = Math.min(source.length, Math.max(0, Math.round(bestIdx * ratio)));
    let start = Math.max(0, approx - 48);
    if (start > 0) {
      const space = source.indexOf(' ', start);
      if (space > 0 && space < approx) start = space + 1;
    }
    let end = Math.min(source.length, start + maxLen);
    if (end < source.length) {
      const space = source.lastIndexOf(' ', end);
      if (space > start + 60) end = space;
    }
    const slice = source.slice(start, end).trim();
    return `${start > 0 ? '…' : ''}${slice}${end < source.length ? '…' : ''}`;
  }
  return clip(doc.summary);
}

export function searchDocs(
  docs: SearchDoc[],
  query: string,
  opts: { filter?: SearchFilter; limit?: number } = {},
): SearchHit[] {
  const filter = opts.filter ?? 'all';
  const limit = opts.limit ?? 200;
  const terms = tokenize(query);
  if (!terms.length) return [];
  const phrase = terms.join(' ');
  const hits: SearchHit[] = [];

  for (const doc of docs) {
    if (!matchesFilter(doc.kind, filter)) continue;
    const title = normalize(doc.title);
    const keywords = normalize(doc.keywords);
    const summary = normalize(doc.summary);
    const body = normalize(doc.body);
    const slug = normalize(doc.id.slice(doc.id.indexOf(':') + 1));

    let score = 0;
    let allMatched = true;
    for (const tok of terms) {
      const s =
        fieldMatchScore(title, tok, 42, 28, 14) +
        fieldMatchScore(keywords, tok, 28, 20, 10) +
        fieldMatchScore(summary, tok, 15, 11, 6) +
        fieldMatchScore(body, tok, 6, 4, 2);
      if (s === 0) {
        allMatched = false;
        break;
      }
      score += s;
    }
    if (!allMatched) continue;

    if (slug === phrase) score += 100;
    if (title === phrase) score += 120;
    else if (title.startsWith(phrase) && (phrase.length > 2 || isWordBoundary(title[phrase.length]))) score += 60;
    else if (phrase.length > 2 && title.includes(phrase)) score += 40;
    if (phrase.length > 2 && keywords.includes(phrase)) score += 32;
    if (phrase.length > 2 && summary.includes(phrase)) score += 20;
    score += KIND_BOOST[doc.kind];

    hits.push({
      doc,
      score,
      excerpt: buildExcerpt(doc, terms),
      terms,
    });
  }

  hits.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return hits.slice(0, limit);
}

/** Escape text and wrap matched terms in <mark>, matching diacritic-insensitively. */
export function highlightText(text: string, terms: string[]): string {
  if (!terms.length || !text) return esc(text);
  const origIdx: number[] = [];
  let norm = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const n = normalize(ch);
    for (let k = 0; k < n.length; k++) {
      norm += n[k];
      origIdx.push(i);
    }
  }
  const ranges: [number, number][] = [];
  for (const tok of terms) {
    if (!tok) continue;
    let pos = norm.indexOf(tok);
    while (pos >= 0) {
      if (tok.length > 2 || isWordBoundary(norm[pos - 1])) {
        const start = origIdx[pos];
        const end = origIdx[pos + tok.length - 1] + 1;
        ranges.push([start, end]);
      }
      pos = norm.indexOf(tok, pos + tok.length);
    }
  }
  if (!ranges.length) return esc(text);
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const prev = merged[merged.length - 1];
    if (prev && r[0] <= prev[1]) prev[1] = Math.max(prev[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  let out = '';
  let cursor = 0;
  for (const [a, b] of merged) {
    if (a > cursor) out += esc(text.slice(cursor, a));
    out += `<mark>${esc(text.slice(a, b))}</mark>`;
    cursor = b;
  }
  if (cursor < text.length) out += esc(text.slice(cursor));
  return out;
}
