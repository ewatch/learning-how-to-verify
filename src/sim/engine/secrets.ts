/**
 * Security-scanning exercise: six tiny scanners run over an agent's PR diff.
 * All keys, packages and advisories here are fake or sample data.
 */
export type ScannerId = 'patterns' | 'entropy' | 'envfiles' | 'newdep' | 'typosquat' | 'vuln';
export const SCANNERS: ScannerId[] = ['patterns', 'entropy', 'envfiles', 'newdep', 'typosquat', 'vuln'];

export interface DiffRow { kind: 'add' | 'ctx'; text: string }
export interface DiffFile { path: string; lines: DiffRow[] }
export interface Finding { scanner: ScannerId; file: number; line: number }

const add = (text: string): DiffRow => ({ kind: 'add', text });
const ctx = (text: string): DiffRow => ({ kind: 'ctx', text });

export const PR: DiffFile[] = [
  { path: 'package.json', lines: [
    ctx('"dependencies": {'),
    ctx('  "express": "^4.19.2",'),
    add('  "left-padd": "^1.0.1",'),
    add('  "lodash": "4.17.15"'),
    ctx('}'),
  ] },
  { path: 'src/config.ts', lines: [
    add("import { env } from 'node:process';"),
    add('export const PORT = Number(env.PORT ?? 3000);'),
    add("export const dbUrl = env.DATABASE_URL ?? 'postgres://localhost/petstore';"),
    add("export const apiKey = 'k8Jx2Qv9LpT4mZr7WbN3cYd6HsEa1UfG';"),
    add("export const awsAccessKeyId = 'AKIAIOSFODNN7EXAMPLE';"),
    add('export const reservationTtlMinutes = 15;'),
  ] },
  { path: '.env', lines: [add('PETSTORE_DB_PASSWORD=petstore-prod-2024'), add('PORT=8080')] },
  { path: 'package-lock.json (excerpt)', lines: [
    add('"node_modules/left-padd": {'),
    add('  "version": "1.0.1"'),
    add('},'),
    add('"node_modules/lodash": {'),
    add('  "version": "4.17.15"'),
    add('},'),
  ] },
];

export type IssueId = 'apikey' | 'aws' | 'envfile' | 'typosquat' | 'cve';
/** the five real problems in the PR, anchored to a (file, line) */
export const ISSUES: { id: IssueId; file: number; line: number }[] = [
  { id: 'apikey', file: 1, line: 3 },
  { id: 'aws', file: 1, line: 4 },
  { id: 'envfile', file: 2, line: 0 },
  { id: 'typosquat', file: 0, line: 2 },
  { id: 'cve', file: 0, line: 3 },
];

/** SAMPLE DATA, not a live feed. */
export const ADVISORIES: { pkg: string; below: string; id: string }[] = [
  { pkg: 'lodash', below: '4.17.21', id: 'CVE-2021-23337' },
  { pkg: 'minimist', below: '1.2.6', id: 'CVE-2021-44906' },
  { pkg: 'node-fetch', below: '2.6.7', id: 'CVE-2022-0235' },
];

export const POPULAR = ['lodash', 'express', 'react', 'left-pad', 'axios', 'chalk', 'moment', 'request', 'commander', 'debug', 'underscore', 'uuid', 'dotenv', 'colors', 'minimist', 'node-fetch'];

// ---- helpers ------------------------------------------------------------------------------

export function shannon(s: string): number {
  if (!s) return 0;
  const counts = new Map<string, number>();
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1);
  let h = 0;
  for (const n of counts.values()) { const p = n / s.length; h -= p * Math.log2(p); }
  return h;
}

export function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

export const ENTROPY_THRESHOLD = 4.0;
export const ENTROPY_MIN_LEN = 20;

export const SECRET_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'AWS access key id', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'GitHub token', re: /\bghp_[A-Za-z0-9]{36}\b/ },
  { name: 'Stripe live key', re: /\bsk_live_[0-9a-zA-Z]{16,}\b/ },
  { name: 'Slack token', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: 'Private key', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

export const isLockfile = (path: string) => /lock(\.json)?\b|\.lock\b/.test(path);
export const isEnvFile = (path: string) => /(^|\/)\.env(\.[\w-]+)?$/.test(path) && !/\.(example|sample|template)$/.test(path);

export function highEntropyTokens(line: string): string[] {
  return (line.match(/[A-Za-z0-9+/_-]{20,}={0,2}/g) ?? []).filter((t) => {
    const classes = [/[a-z]/, /[A-Z]/, /[0-9]/].filter((r) => r.test(t)).length;
    return classes >= 2 && shannon(t) >= ENTROPY_THRESHOLD;
  });
}

const DEP_LINE = /^\s*"(@?[\w./-]+)":\s*"([~^]?\d[^"]*)"\s*,?\s*$/;
export const parseDep = (line: string): { name: string; version: string } | null => {
  const m = DEP_LINE.exec(line);
  return m && m[1] !== 'version' ? { name: m[1], version: m[2].replace(/^[~^]/, '') } : null;
};

export function cmpVersion(a: string, b: string): number {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d < 0 ? -1 : 1; }
  return 0;
}

export const advisoryFor = (name: string, version: string) => ADVISORIES.find((a) => a.pkg === name && cmpVersion(version, a.below) < 0);

export function typosquatOf(name: string): string | null {
  if (name.startsWith('@') || name.length < 5 || POPULAR.includes(name)) return null;
  return POPULAR.find((p) => editDistance(name, p) <= 2) ?? null;
}

// ---- scanners -----------------------------------------------------------------------------

const isManifest = (path: string) => path === 'package.json';

export function scan(files: DiffFile[], id: ScannerId): Finding[] {
  const out: Finding[] = [];
  files.forEach((f, fi) => {
    if (id === 'envfiles') { if (isEnvFile(f.path)) f.lines.forEach((_, li) => out.push({ scanner: id, file: fi, line: li })); return; }
    let lockName = '';
    f.lines.forEach((row, li) => {
      const hit = () => out.push({ scanner: id, file: fi, line: li });
      if (id === 'vuln' && isLockfile(f.path)) {
        const nm = /"node_modules\/([^"]+)":/.exec(row.text);
        if (nm) lockName = nm[1];
        const v = /^\s*"version":\s*"([^"]+)"/.exec(row.text);
        if (row.kind === 'add' && v && lockName && advisoryFor(lockName, v[1])) hit();
        return;
      }
      if (row.kind !== 'add') return;
      if (id === 'patterns') { if (SECRET_PATTERNS.some((p) => p.re.test(row.text))) hit(); }
      else if (id === 'entropy') { if (!isLockfile(f.path) && highEntropyTokens(row.text).length) hit(); }
      else if (isManifest(f.path)) {
        const dep = parseDep(row.text);
        if (!dep) return;
        if (id === 'newdep') hit();
        else if (id === 'typosquat') { if (typosquatOf(dep.name)) hit(); }
        else if (id === 'vuln') { if (advisoryFor(dep.name, dep.version)) hit(); }
      }
    });
  });
  return out;
}

export function analyse(files: DiffFile[], enabled: Iterable<ScannerId>) {
  const on = SCANNERS.filter((s) => new Set(enabled).has(s));
  const findings = on.flatMap((s) => scan(files, s));
  const issues = ISSUES.map((is) => ({ ...is, caughtBy: on.filter((s) => findings.some((f) => f.scanner === s && f.file === is.file && f.line === is.line)) }));
  const slipping = issues.filter((i) => i.caughtBy.length === 0).map((i) => i.id);
  return { findings, issues, slipping, solved: slipping.length === 0 };
}
