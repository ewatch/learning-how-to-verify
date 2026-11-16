import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ADVISORIES, ENTROPY_THRESHOLD, ISSUES, PR, SCANNERS, analyse, cmpVersion, editDistance, highEntropyTokens, scan, shannon, typosquatOf, type DiffFile, type ScannerId } from '../../src/sim/engine/secrets';

const one = (path: string, ...text: string[]): DiffFile[] => [{ path, lines: text.map((t) => ({ kind: 'add' as const, text: t })) }];
const hits = (files: DiffFile[], s: ScannerId) => scan(files, s).length;

describe('shannon entropy', () => {
  it('sanity values', () => {
    expect(shannon('')).toBe(0);
    expect(shannon('aaaaaaaa')).toBe(0);
    expect(shannon('abababab')).toBeCloseTo(1, 5);
    expect(shannon('k8Jx2Qv9LpT4mZr7WbN3cYd6HsEa1UfG')).toBeGreaterThan(ENTROPY_THRESHOLD);
    expect(shannon('reservationTtlMinutes')).toBeLessThan(ENTROPY_THRESHOLD);
    expect(shannon('AKIAIOSFODNN7EXAMPLE')).toBeLessThan(ENTROPY_THRESHOLD);
  });
});

describe('edit distance', () => {
  it('known values', () => {
    expect(editDistance('left-pad', 'left-padd')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('', 'abc')).toBe(3);
  });
  it('is symmetric and zero on equal strings', () => {
    fc.assert(fc.property(fc.string({ maxLength: 12 }), fc.string({ maxLength: 12 }), (a, b) => editDistance(a, b) === editDistance(b, a)));
    fc.assert(fc.property(fc.string({ maxLength: 12 }), (a) => editDistance(a, a) === 0));
  });
  it('satisfies the triangle inequality', () => {
    fc.assert(fc.property(fc.string({ maxLength: 8 }), fc.string({ maxLength: 8 }), fc.string({ maxLength: 8 }), (a, b, c) => editDistance(a, c) <= editDistance(a, b) + editDistance(b, c)));
  });
});

describe('scanners', () => {
  it('secret patterns: positive and negative', () => {
    expect(hits(one('a.ts', "const k = 'AKIAIOSFODNN7EXAMPLE';"), 'patterns')).toBe(1);
    expect(hits(one('a.ts', "const k = 'sk_live_51HabcdefghijKLMNOP';"), 'patterns')).toBe(1);
    expect(hits(one('a.ts', '-----BEGIN RSA PRIVATE KEY-----'), 'patterns')).toBe(1);
    expect(hits(one('a.ts', "const k = 'AKIA-not-a-key';"), 'patterns')).toBe(0);
  });
  it('entropy: flags random keys, not identifiers or paths', () => {
    expect(hits(one('a.ts', "export const apiKey = 'k8Jx2Qv9LpT4mZr7WbN3cYd6HsEa1UfG';"), 'entropy')).toBe(1);
    expect(highEntropyTokens("import { x } from './services/reservation-handler';")).toEqual([]);
    expect(hits(one('a.ts', 'export const reservationTtlMinutes = 15;'), 'entropy')).toBe(0);
  });
  it('entropy ignores lockfiles', () => {
    expect(hits(one('package-lock.json', '"integrity": "sha512-k8Jx2Qv9LpT4mZr7WbN3cYd6HsEa1UfG"'), 'entropy')).toBe(0);
  });
  it('.env files', () => {
    expect(hits(one('.env', 'A=1', 'B=2'), 'envfiles')).toBe(2);
    expect(hits(one('config/.env.production', 'A=1'), 'envfiles')).toBe(1);
    expect(hits(one('.env.example', 'A='), 'envfiles')).toBe(0);
    expect(hits(one('src/env.ts', 'export const a = 1;'), 'envfiles')).toBe(0);
  });
  it('new dependency gate: added dependency lines only', () => {
    expect(hits(one('package.json', '  "zod": "^3.23.8"'), 'newdep')).toBe(1);
    expect(hits([{ path: 'package.json', lines: [{ kind: 'ctx', text: '  "express": "^4.19.2",' }] }], 'newdep')).toBe(0);
    expect(hits(one('package.json', '  "version": "1.2.3",'), 'newdep')).toBe(0);
  });
  it('typosquat', () => {
    expect(typosquatOf('left-padd')).toBe('left-pad');
    expect(typosquatOf('expresss')).toBe('express');
    expect(typosquatOf('lodash')).toBeNull();
    expect(typosquatOf('zod')).toBeNull();
    expect(typosquatOf('petstore-client')).toBeNull();
  });
  it('known vulnerabilities', () => {
    expect(hits(one('package.json', '  "lodash": "4.17.15"'), 'vuln')).toBe(1);
    expect(hits(one('package.json', '  "lodash": "^4.17.21"'), 'vuln')).toBe(0);
    expect(hits(one('package.json', '  "left-padd": "^1.0.1"'), 'vuln')).toBe(0);
    expect(cmpVersion('4.17.9', '4.17.21')).toBe(-1);
    expect(ADVISORIES.length).toBeGreaterThan(0);
  });
  it('no false positives on normal code lines', () => {
    const normal = one('src/app.ts',
      "import { reservePet } from './reservations';",
      'export function reserve(petId: string, person: string) {',
      "  if (!petId) throw new Error('petId is required');",
      '  const result = await fetch(`${baseUrl}/pets/${petId}/reservation`);',
      "  return { ok: false, reason: 'taken' as const };",
      '}',
      'const MAX_RESERVATION_MINUTES = 15;');
    for (const s of SCANNERS.filter((x) => x !== 'envfiles' && x !== 'newdep')) expect(hits(normal, s)).toBe(0);
  });
});

describe('the PR exercise', () => {
  it('each issue is caught by the intended scanners only', () => {
    const a = analyse(PR, SCANNERS);
    const by = Object.fromEntries(a.issues.map((i) => [i.id, i.caughtBy]));
    expect(by.apikey).toEqual(['entropy']);
    expect(by.aws).toEqual(['patterns']);
    expect(by.envfile).toEqual(['envfiles']);
    expect(by.typosquat).toEqual(['newdep', 'typosquat']);
    expect(by.cve).toEqual(['newdep', 'vuln']);
    expect(a.solved).toBe(true);
  });
  it('the typosquatted package has no CVE: vuln alone misses it', () => {
    expect(analyse(PR, ['vuln']).slipping).toContain('typosquat');
    expect(analyse(PR, ['newdep']).slipping).toEqual(['apikey', 'aws', 'envfile']);
  });
  it('nothing selected misses everything; issue anchors exist', () => {
    expect(analyse(PR, []).slipping.length).toBe(ISSUES.length);
    for (const i of ISSUES) expect(PR[i.file].lines[i.line]).toBeDefined();
  });
});
