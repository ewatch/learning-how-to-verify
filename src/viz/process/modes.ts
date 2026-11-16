import { type Ctx, type ModeDef, arrow, defs, flame, funnel, layerMid, lines } from './frame';
import {
  ALLOWED, HIDDEN, NIELSEN_L, SPLIT_SIZE, TASKS, archBuildFails, attention, attentionSplit, evalScores, followedShare,
  isLgtm, nielsen, ruleRuns, stepsFor, taskResult, type Edge, type Grading, type Variant,
} from './logic';

const pct = (x: number) => `${Math.round(x * 100)}%`;
const num = (c: Ctx, n: number) => n.toLocaleString(c.lang);

// ---------------- oncall-experience ----------------
const FG = { x: 10, y: 6, w: 190, lh: 28 };
const oncall: ModeDef = {
  max: 3, ms: 900,
  label: (c) => c.t('Incident in production turns into a lint rule in the static layer of the funnel.', 'Incident in Production wird zu einer Lint-Regel in der Static-Schicht des Funnels.'),
  svg: (c) => {
    const p = c.phase, mid1 = layerMid(FG, 1);
    let o = defs + funnel(FG, c.lang, p >= 2 ? [1] : []);
    o += `<rect x="10" y="176" width="190" height="30" rx="4" class="box"/><text x="105" y="196" text-anchor="middle" class="tb">${c.t('Production', 'Production')}</text>`;
    if (p < 3) o += flame(105, 168, 0.9);
    if (p >= 1 && p < 3) o += `<g class="pv-pop"><rect x="215" y="30" width="135" height="64" rx="6" class="box"/>${lines(282, 52, [c.t('Postmortem', 'Postmortem'), c.t('double reservation', 'Doppelte Reservierung')], 't')}</g>`;
    if (p === 2) o += `<g class="pv-rise" style="--from:130px"><rect x="${mid1.x - 42}" y="${mid1.y - 10}" width="84" height="20" rx="4" class="okc"/><text x="${mid1.x}" y="${mid1.y + 4}" text-anchor="middle" class="tb">${c.t('new lint rule', 'neue Lint-Regel')}</text></g>`;
    if (p >= 3) {
      o += `<g><rect x="${mid1.x - 42}" y="${mid1.y - 10}" width="84" height="20" rx="4" class="okc"/><text x="${mid1.x}" y="${mid1.y + 4}" text-anchor="middle" class="tb">${c.t('lint rule', 'Lint-Regel')}</text></g>`;
      o += `<g class="pv-fall"><circle cx="${mid1.x}" cy="${FG.y - 0}" r="0"/><path d="M${mid1.x - 6} ${FG.y + 13} l12 0 l-6 -8 z" fill="var(--bad)"/></g>`;
      o += `<text x="${mid1.x}" y="${FG.y + 5}" text-anchor="middle" class="bad-t">${c.t('bug', 'Bug')}</text>`;
      o += `<g class="pv-pop"><rect x="215" y="30" width="135" height="64" rx="6" class="okc"/>${lines(282, 56, [c.t('Next time:', 'Nächstes Mal:'), c.t('stopped here', 'hier gestoppt')], 'tb')}</g>`;
      o += `<path d="M${mid1.x - 52} ${mid1.y} H${mid1.x - 46}" class="line"/>`;
    }
    return o;
  },
  controls: [{ kind: 'button', label: (c) => c.t('Replay incident', 'Incident abspielen'), on: (c) => c.play() }],
};

// ---------------- code-review ----------------
const review: ModeDef = {
  max: 0,
  init: (c) => { c.s.lines = 400; c.s.split = false; },
  label: (c) => c.t('Chart: comments per 100 lines fall as pull request size grows.', 'Diagramm: Kommentare pro 100 Zeilen sinken mit der Größe des Pull Requests.'),
  svg: (c) => {
    const X = (l: number) => 40 + ((l - 50) / 1950) * 300, Y = (a: number) => 160 - (a / 7) * 130;
    const pts = (f: (l: number) => number) => Array.from({ length: 40 }, (_, i) => { const l = 50 + (i * 1950) / 39; return `${X(l).toFixed(1)},${Y(f(l)).toFixed(1)}`; }).join(' ');
    const L = c.s.lines as number, split = c.s.split as boolean;
    const a = split ? attentionSplit(L) : attention(L);
    let o = `<line x1="40" y1="160" x2="345" y2="160" class="axis"/><line x1="40" y1="25" x2="40" y2="160" class="axis"/>`;
    o += `<text x="42" y="20" class="t">${c.t('comments / 100 lines', 'Kommentare / 100 Zeilen')}</text><text x="345" y="182" text-anchor="end" class="t">${c.t('lines changed', 'Zeilen geändert')}</text>`;
    o += `<polyline points="${pts(attention)}" class="curve ${split ? 'dim' : ''}"/>`;
    if (split) o += `<polyline points="${pts(attentionSplit)}" class="curve-ok"/>`;
    o += `<circle cx="${X(L)}" cy="${Y(a)}" r="6" class="${split ? 'dot-ok' : isLgtm(a) ? 'dot-bad' : 'dot'}"/>`;
    if (isLgtm(a)) o += `<g class="pv-pop"><rect x="${Math.min(X(L) - 30, 280)}" y="${Y(a) - 38}" width="60" height="22" rx="4" class="badc"/><text x="${Math.min(X(L), 310)}" y="${Y(a) - 23}" text-anchor="middle" class="tb">LGTM</text></g>`;
    o += `<text x="40" y="206" class="tb">${num(c, L)} ${c.t('lines', 'Zeilen')} · ${a.toFixed(1)} ${c.t('comments / 100', 'Komm. / 100')}</text>`;
    if (split) o += `<text x="40" y="224" class="t">${stepsFor(L)} × ≤${SPLIT_SIZE} ${c.t('lines', 'Zeilen')}</text>`;
    return o;
  },
  controls: [
    { kind: 'range', label: (c) => c.t('PR size', 'PR-Größe'), min: 50, max: 2000, step: 50, get: (c) => c.s.lines, set: (c, v) => { c.s.lines = v; }, out: (c) => num(c, c.s.lines) },
    { kind: 'button', label: (c) => c.t('Split into small steps', 'In kleine Schritte teilen'), on: (c) => { c.s.split = !c.s.split; }, pressed: (c) => c.s.split },
  ],
};

// ---------------- evals ----------------
const evals: ModeDef = {
  max: 0,
  init: (c) => { c.s.run = null as Variant | null; c.s.g = 'tests' as Grading; },
  label: (c) => c.t('Twelve task tiles turn green or red after each run, with two scores.', 'Zwölf Task-Kacheln werden nach jedem Lauf grün oder rot, dazu zwei Scores.'),
  svg: (c) => {
    const run = c.s.run as Variant | null, g = c.s.g as Grading;
    let o = '';
    for (let t = 0; t < TASKS; t++) {
      const x = 10 + (t % 6) * 56, y = 8 + Math.floor(t / 6) * 44;
      const r = run ? taskResult(run, 0, t, g) : null;
      const cls = r === 'pass' ? 'okc' : r === 'fail' ? 'badc' : r === 'overstated' ? 'warnc' : 'box';
      o += `<rect x="${x}" y="${y}" width="48" height="36" rx="5" class="${cls}"/><text x="${x + 24}" y="${y + 22}" text-anchor="middle" class="tb">#${t + 1}${r === 'overstated' ? '?' : ''}</text>`;
    }
    const bars: [Variant, string, number][] = [['before', c.t('Before', 'Vorher'), 112], ['after', c.t('After', 'Nachher'), 160]];
    for (const [v, lab, y] of bars) {
      const shown = run === v || (run === 'after' && v === 'before');
      o += `<text x="10" y="${y + 13}" class="t">${lab}</text><rect x="70" y="${y}" width="230" height="18" rx="3" class="box"/>`;
      if (shown) {
        const s = evalScores(v, g);
        o += `<rect x="70" y="${y}" width="${230 * s.mean}" height="18" rx="3" class="${v === 'after' ? 'fill-ok' : 'fill-l'}"/>`;
        o += `<rect x="${70 + 230 * s.min}" y="${y + 5}" width="${Math.max(2, 230 * (s.max - s.min))}" height="8" class="band"/>`;
        o += `<text x="306" y="${y + 14}" class="tb">${pct(s.mean)}</text>`;
      }
    }
    o += `<text x="10" y="206" class="t">${c.t('band = 3 runs', 'Band = 3 Läufe')}${run ? '' : ' · ' + c.t('press run', 'Lauf starten')}</text>`;
    if (g === 'tests' && run) o += `<text x="10" y="224" class="warn-t">${c.t('tests only: may overstate', 'nur Tests: überschätzt evtl.')}</text>`;
    return o;
  },
  controls: [
    { kind: 'button', label: (c) => c.t('Run before', 'Lauf vorher'), on: (c) => { c.s.run = 'before'; }, pressed: (c) => c.s.run === 'before' },
    { kind: 'button', label: (c) => c.t('Run after AGENTS.md change', 'Lauf nach AGENTS.md-Änderung'), on: (c) => { c.s.run = 'after'; }, pressed: (c) => c.s.run === 'after' },
    { kind: 'button', label: (c) => c.t('+ differential / human sample', '+ Differential / Human-Stichprobe'), on: (c) => { c.s.g = c.s.g === 'tests' ? 'combined' : 'tests'; }, pressed: (c) => c.s.g === 'combined' },
  ],
};

// ---------------- agent-rules ----------------
const rules: ModeDef = {
  max: 0,
  init: (c) => { c.s.layer = 'prose'; c.s.moved = false; },
  label: (c) => c.t('A rule card moves from the prose layer to the static analysis layer; agent runs become all green.', 'Eine Regelkarte wandert von der Prosa- in die Static-Analysis-Schicht; alle Agent-Läufe werden grün.'),
  svg: (c) => {
    const li = c.s.layer === 'prose' ? 3 : 1, m = layerMid(FG, li);
    let o = defs + funnel(FG, c.lang, [li]);
    o += `<g data-act="move" role="button" tabindex="0" aria-label="${c.t('Move rule', 'Regel verschieben')}" class="pv-card ${c.s.moved ? 'pv-rise' : ''}" style="--from:${c.s.moved ? 56 : 0}px"><rect x="${m.x - 46}" y="${m.y - 11}" width="92" height="22" rx="4" class="${c.s.layer === 'prose' ? 'warnc' : 'okc'}"/><text x="${m.x}" y="${m.y + 4}" text-anchor="middle" class="tb">${c.t('integer money', 'Geld als Integer')}</text></g>`;
    o += `<text x="215" y="22" class="tb">${c.t('Agent runs', 'Agent-Läufe')}</text>`;
    ruleRuns(c.s.layer).forEach((r, i) => {
      const x = 215 + (i % 5) * 28, y = 34 + Math.floor(i / 5) * 32;
      o += `<rect x="${x}" y="${y}" width="22" height="24" rx="4" class="${r ? 'okc' : 'badc'}"/><text x="${x + 11}" y="${y + 17}" text-anchor="middle" class="tb">${r ? '✓' : '✗'}</text>`;
    });
    o += `<text x="215" y="118" class="tb">${pct(followedShare(c.s.layer))} ${c.t('followed', 'befolgt')}</text>`;
    o += `<text x="215" y="140" class="t">${c.s.layer === 'prose' ? 'AGENTS.md' : c.t('lint / type check', 'Lint / Typ-Check')}</text>`;
    return o;
  },
  act: (c) => { c.s.layer = c.s.layer === 'prose' ? 'static' : 'prose'; c.s.moved = c.s.layer === 'static'; },
  controls: [{ kind: 'button', label: (c) => (c.s.layer === 'prose' ? c.t('Move to lint / type', 'Zu Lint / Typ verschieben') : c.t('Back to AGENTS.md', 'Zurück zu AGENTS.md')), on: (c) => { c.s.layer = c.s.layer === 'prose' ? 'static' : 'prose'; c.s.moved = c.s.layer === 'static'; } }],
};

// ---------------- threat-modeling ----------------
const THREATS: { k: string; l: string; x: number; y: number; en: [string, string, string, string]; de: [string, string, string, string] }[] = [
  { k: 'S', l: 'Spoofing', x: 30, y: 66, en: ['Spoofing', 'stolen session', 'short-lived token', 'auth test'], de: ['Spoofing', 'gestohlene Session', 'kurzlebiges Token', 'Auth-Test'] },
  { k: 'T', l: 'Tampering', x: 108, y: 76, en: ['Tampering', 'client sends price', 'server recomputes', 'API test'], de: ['Tampering', 'Client sendet Preis', 'Server rechnet neu', 'API-Test'] },
  { k: 'R', l: 'Repudiation', x: 150, y: 88, en: ['Repudiation', '"I never reserved"', 'audit log entry', 'log test'], de: ['Repudiation', '„Ich war das nicht“', 'Audit-Log-Eintrag', 'Log-Test'] },
  { k: 'I', l: 'Info disclosure', x: 312, y: 28, en: ['Info disclosure', 'owner data leaks', 'field allow-list', 'contract test'], de: ['Info disclosure', 'Besitzerdaten leaken', 'Feld-Allowlist', 'Contract Test'] },
  { k: 'D', l: 'Denial of service', x: 175, y: 128, en: ['Denial of service', 'request flood', 'rate limit', 'load test'], de: ['Denial of service', 'Request-Flut', 'Rate Limit', 'Lasttest'] },
  { k: 'E', l: 'Elevation', x: 200, y: 88, en: ['Elevation', 'user acts as admin', 'role check', 'authz test'], de: ['Elevation', 'User handelt als Admin', 'Rollenprüfung', 'Authz-Test'] },
];
const threat: ModeDef = {
  max: 6, ms: 450,
  init: (c) => { c.s.sel = null; },
  label: (c) => c.t('Data flow diagram with browser, API, database, payment provider and a trust boundary; six STRIDE letters.', 'Datenflussdiagramm mit Browser, API, Datenbank, Zahlungsanbieter und Trust Boundary; sechs STRIDE-Buchstaben.'),
  svg: (c) => {
    const box = (x: number, y: number, w: number, h: number, t: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="box"/><text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" class="tb">${t}</text>`;
    let o = defs + `<line x1="100" y1="14" x2="100" y2="215" class="boundary"/><text x="104" y="226" class="t">${c.t('trust boundary', 'Trust Boundary')}</text>`;
    o += box(10, 100, 74, 40, 'Browser') + box(135, 100, 70, 40, 'API') + box(270, 30, 80, 36, 'DB') + box(270, 150, 80, 36, c.t('Payment', 'Payment'));
    o += arrow(84, 120, 135, 120) + arrow(205, 112, 270, 50) + arrow(205, 128, 270, 166);
    THREATS.forEach((t, i) => {
      if (i >= c.phase) return;
      const y = t.k === 'S' ? 92 : t.k === 'T' ? 108 : t.k === 'R' ? 90 : t.k === 'D' ? 150 : t.k === 'E' ? 90 : 36;
      const x = t.k === 'S' ? 30 : t.k === 'T' ? 108 : t.k === 'R' ? 150 : t.k === 'D' ? 170 : t.k === 'E' ? 192 : 312;
      const yy = t.k === 'T' ? 142 : y;
      o += `<g data-act="${t.k}" role="button" tabindex="0" aria-label="${t.l}" class="pv-pop pv-badge ${c.s.sel === t.k ? 'sel' : ''}"><circle cx="${x}" cy="${yy}" r="12"/><text x="${x}" y="${yy + 5}" text-anchor="middle">${t.k}</text></g>`;
    });
    return o;
  },
  html: (c) => {
    const t = THREATS.find((x) => x.k === c.s.sel);
    if (!t) return `<p class="pv-hint">${c.t('Select a letter.', 'Buchstaben wählen.')}</p>`;
    const [n, th, mi, te] = c.lang === 'de' ? t.de : t.en;
    return `<p class="pv-chain"><b>${n}</b>: <span class="chip bad">${th}</span> → <span class="chip">${mi}</span> → <span class="chip ok">${te}</span></p>`;
  },
  act: (c, k) => { c.s.sel = k; },
  controls: [{ kind: 'button', label: (c) => c.t('Replay', 'Neu abspielen'), on: (c) => { c.s.sel = null; c.play(); } }],
};

// ---------------- penetration-tests ----------------
const pen: ModeDef = {
  max: 4, ms: 800,
  init: (c) => { c.s.fixed = false; },
  label: (c) => c.t('Attack chain: recon, weak endpoint, missing authorization, all pets reserved.', 'Angriffskette: Recon, schwacher Endpoint, fehlende Autorisierung, alle Pets reserviert.'),
  svg: (c) => {
    const names = [[c.t('Recon', 'Recon')], [c.t('Weak', 'Schwacher'), c.t('endpoint', 'Endpoint')], [c.t('Missing', 'Fehlende'), c.t('authz', 'Authz')], [c.t('All pets', 'Alle Pets'), c.t('reserved', 'reserviert')]];
    const fixed = c.s.fixed as boolean;
    let o = defs;
    names.forEach((n, i) => {
      const x = 8 + i * 88, lit = c.phase > i;
      const blocked = fixed && i === 2 && lit, dead = fixed && i === 3;
      const cls = blocked ? 'okc' : dead ? 'box dim' : lit ? (i === 3 ? 'badc' : 'warnc') : 'box';
      o += `<rect x="${x}" y="60" width="76" height="52" rx="6" class="${cls} ${lit && !dead ? 'pv-pop' : ''}"/>${lines(x + 38, 82, n, 'tb')}`;
      if (blocked) o += `<g class="pv-pop"><line x1="${x + 6}" y1="54" x2="${x + 70}" y2="118" class="cut"/><line x1="${x + 70}" y1="54" x2="${x + 6}" y2="118" class="cut"/></g>`;
      if (i < 3) o += arrow(x + 76, 86, x + 88, 86, fixed && i === 2 ? 'line dim' : lit && c.phase > i + 1 ? 'line hot' : 'line');
    });
    o += `<text x="8" y="150" class="t">${c.t('One account', 'Ein Account')} → ${fixed ? c.t('blocked', 'blockiert') : c.phase >= 4 ? c.t('every pet', 'jedes Pet') : '…'}</text>`;
    return o;
  },
  html: (c) => c.s.fixed && c.phase >= 3 ? `<p class="pv-chain"><span class="chip ok">${c.t('regression test', 'Regressionstest')}</span> ${c.t('user A cannot reserve for user B', 'User A kann nicht für User B reservieren')}</p>` : '',
  controls: [
    { kind: 'button', label: (c) => c.t('Replay attack', 'Angriff abspielen'), on: (c) => c.play() },
    { kind: 'button', label: (c) => c.t('Fix', 'Fix'), on: (c) => { c.s.fixed = !c.s.fixed; c.play(); }, pressed: (c) => c.s.fixed },
  ],
};

// ---------------- usability-tests ----------------
const usab: ModeDef = {
  max: 0,
  init: (c) => { c.s.n = 5; },
  label: (c) => c.t('Curve of usability problems found against the number of test users.', 'Kurve der gefundenen Usability-Probleme über die Anzahl Testpersonen.'),
  svg: (c) => {
    const X = (n: number) => 40 + ((n - 1) / 14) * 300, Y = (p: number) => 170 - p * 140;
    const n = c.s.n as number;
    const pts = Array.from({ length: 15 }, (_, i) => `${X(i + 1)},${Y(nielsen(i + 1))}`).join(' ');
    let o = `<line x1="40" y1="170" x2="345" y2="170" class="axis"/><line x1="40" y1="25" x2="40" y2="170" class="axis"/>`;
    o += `<text x="42" y="20" class="t">${c.t('problems found', 'Probleme gefunden')}</text><text x="345" y="190" text-anchor="end" class="t">${c.t('test users', 'Testpersonen')}</text>`;
    o += `<polyline points="${pts}" class="curve"/>`;
    o += `<line x1="${X(5)}" y1="${Y(nielsen(5))}" x2="${X(5)}" y2="170" class="boundary"/><text x="${X(5) + 6}" y="${Y(nielsen(5)) + 18}" class="t">5 ≈ 85%</text>`;
    o += `<text x="${X(10)}" y="${Y(nielsen(10)) + 22}" text-anchor="middle" class="t">${c.t('diminishing returns', 'abnehmender Ertrag')}</text>`;
    o += `<circle cx="${X(n)}" cy="${Y(nielsen(n))}" r="6" class="dot"/>`;
    o += `<text x="40" y="208" class="tb">N(1−(1−L)^n), L≈${NIELSEN_L}</text><text x="40" y="226" class="warn-t">${c.t('a rule of thumb, debated', 'Faustregel, umstritten')}</text>`;
    return o;
  },
  controls: [{ kind: 'range', label: (c) => c.t('Users', 'Personen'), min: 1, max: 15, step: 1, get: (c) => c.s.n, set: (c, v) => { c.s.n = v; }, out: (c) => `${c.s.n} → ${pct(nielsen(c.s.n))}` }],
};

// ---------------- refactoring ----------------
const refactor: ModeDef = {
  max: 3, ms: 800,
  init: (c) => { c.s.noTests = false; },
  label: (c) => c.t('Tangled modules become clean modules while a bar of pinned behaviours stays green.', 'Verworrene Module werden aufgeräumt, während eine Leiste festgehaltener Verhalten grün bleibt.'),
  svg: (c) => {
    const no = c.s.noTests as boolean, p = c.phase;
    const bx = (x: number, y: number, t: string, cls = 'box') => `<rect x="${x}" y="${y}" width="44" height="26" rx="4" class="${cls}"/><text x="${x + 22}" y="${y + 17}" text-anchor="middle" class="tb">${t}</text>`;
    let o = defs + `<text x="10" y="16" class="t">${c.t('Before', 'Vorher')}</text><text x="200" y="16" class="t ${p >= 2 ? '' : 'dim'}">${c.t('After', 'Nachher')}</text>`;
    const A = [[20, 30], [100, 30], [20, 100], [100, 100]] as const;
    const names = ['UI', 'API', 'Dom', 'DB'];
    const tang: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [3, 0], [2, 1]];
    tang.forEach(([a, b]) => { o += `<line x1="${A[a]![0] + 22}" y1="${A[a]![1] + 13}" x2="${A[b]![0] + 22}" y2="${A[b]![1] + 13}" class="line tang"/>`; });
    A.forEach(([x, y], i) => { o += bx(x, y, names[i]!); });
    o += `<g class="${p >= 2 ? 'pv-pop' : 'hide'}">`;
    const B = [200, 250, 300].map((x, i) => [x, 30 + i * 0] as const);
    ['UI', 'API', 'Dom'].forEach((n, i) => { o += bx(200 + i * 52, 30, n, 'okc'); });
    o += bx(200, 100, 'DB', 'okc').replace('x="200"', 'x="226"').replace('x="222"', 'x="248"');
    o += arrow(244, 43, 252, 43) + arrow(296, 43, 304, 43) + `</g>`;
    void B;
    o += `<text x="10" y="170" class="t">${c.t('Behaviour pinned', 'Verhalten festgehalten')}</text>`;
    for (let i = 0; i < 8; i++) {
      const x = 10 + i * 42, bad = no && i === 5 && p >= 2;
      o += `<rect x="${x}" y="178" width="36" height="22" rx="3" class="${no ? 'box' : 'okc'}"/><text x="${x + 18}" y="194" text-anchor="middle" class="tb">${no ? '?' : '✓'}</text>`;
      if (bad) o += `<circle cx="${x + 18}" cy="212" r="0"/>`;
    }
    if (no && p >= 2) o += `<g class="pv-flash"><rect x="10" y="206" width="340" height="20" rx="3" class="badc"/><text x="180" y="221" text-anchor="middle" class="tb">${c.t('production: 1 result changed', 'Production: 1 Ergebnis anders')}</text></g>`;
    return o;
  },
  controls: [
    { kind: 'button', label: (c) => c.t('Refactor', 'Umbauen'), on: (c) => c.play() },
    { kind: 'button', label: (c) => c.t('No tests', 'Keine Tests'), on: (c) => { c.s.noTests = !c.s.noTests; c.play(); }, pressed: (c) => c.s.noTests },
  ],
};

// ---------------- architecture ----------------
const MODS = ['ui', 'api', 'domain', 'db'] as const;
const arch: ModeDef = {
  max: 3, ms: 800,
  init: (c) => { c.s.enforced = true; },
  label: (c) => c.t('Module graph ui, api, domain, db with an allowed direction and a forbidden import from domain to ui.', 'Modulgraph ui, api, domain, db mit erlaubter Richtung und verbotenem Import von domain nach ui.'),
  svg: (c) => {
    const X = (i: number) => 8 + i * 88, enforced = c.s.enforced as boolean;
    const bad: Edge = ['domain', 'ui'];
    const fails = archBuildFails([bad], enforced);
    let o = defs;
    MODS.forEach((m, i) => { o += `<rect x="${X(i)}" y="50" width="76" height="40" rx="6" class="box"/><text x="${X(i) + 38}" y="75" text-anchor="middle" class="tb">${m}</text>`; });
    ALLOWED.forEach(([a, b]) => { const i = MODS.indexOf(a), j = MODS.indexOf(b); o += arrow(X(i) + 76, 70, X(j), 70, 'line ok-l'); });
    if (c.phase >= 1) {
      const x1 = X(2) + 38, x2 = X(0) + 38;
      o += `<path d="M${x1} 90 C${x1} 150 ${x2} 150 ${x2} 92" class="line ${fails && c.phase >= 2 ? 'bad-l dim' : 'bad-l'} pv-pop" marker-end="url(#pv-ah)"/>`;
      o += `<text x="${(x1 + x2) / 2}" y="140" text-anchor="middle" class="bad-t">import domain → ui</text>`;
    }
    if (c.phase >= 2) {
      o += fails
        ? `<g class="pv-pop"><rect x="60" y="170" width="240" height="30" rx="5" class="badc"/><text x="180" y="190" text-anchor="middle" class="tb">${c.t('architecture test: FAIL', 'Architekturtest: FAIL')}</text></g>`
        : `<g class="pv-pop"><rect x="60" y="170" width="240" height="30" rx="5" class="warnc"/><text x="180" y="190" text-anchor="middle" class="tb">${c.t('merged, rule only in prose', 'gemerged, Regel nur Prosa')}</text></g>`;
    }
    o += `<text x="8" y="32" class="t">${c.t('allowed: left → right', 'erlaubt: links → rechts')}</text>`;
    return o;
  },
  controls: [
    { kind: 'button', label: (c) => c.t('Agent adds import', 'Agent ergänzt Import'), on: (c) => c.play() },
    { kind: 'button', label: (c) => c.t('Rule only in AGENTS.md', 'Regel nur in AGENTS.md'), on: (c) => { c.s.enforced = !c.s.enforced; c.play(); }, pressed: (c) => !c.s.enforced },
  ],
};

export const MODE_DEFS: Record<string, ModeDef> = {
  'oncall-experience': oncall, 'code-review': review, evals, 'agent-rules': rules, 'threat-modeling': threat,
  'penetration-tests': pen, 'usability-tests': usab, refactoring: refactor, architecture: arch,
};
void HIDDEN;
