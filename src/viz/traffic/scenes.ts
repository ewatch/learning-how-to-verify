// One scene per mode: static SVG backdrop + dot flow + controls + live stats. Logic lives in ./logic.
import { h, rng } from '../../sim/ui/kit';
import { s, text, box, line, curve, Stage, type Pt } from './stage';
import {
  route, Breaker, MAX_RETRIES, SLOW_FAIL_RATE, shadowCall, makeResp, learnNoise, classifyDiff, type Resp,
  Recorder, sampleReq, MASK, ChaosSim, POOL, explore, EXPLORE_SEED, API_NODES, API_EDGES, BUG_SEQ, type ApiNode, type SideEffects,
} from './logic';
import type { Lang } from './text';

export interface Ctx { bg: SVGGElement; stage: Stage; panel: HTMLElement; controls: HTMLElement; t: (k: string) => string; lang: Lang; status: (msg: string) => void }
export interface Scene {
  step(dt: number): void;
  reset(): void;
  /** seconds to fast-forward for the reduced-motion end state */
  settle: number;
  /** jump to the end state; returns extra seconds to simulate afterwards */
  finish?(): number;
}

const U: Pt = [56, 122];
const P: Pt = [122, 122];

function slider(label: string, min: number, max: number, step: number, val: number, fmt: (v: number) => string, on: (v: number) => void) {
  const out = h('output', {}, fmt(val));
  const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
  inp.addEventListener('input', () => { const v = Number(inp.value); out.textContent = fmt(v); on(v); });
  return h('label', { class: 'tv-ctl' }, h('span', {}, label), inp, out);
}
function toggle(label: string, val: boolean, on: (v: boolean) => void) {
  const inp = h('input', { type: 'checkbox', checked: val });
  inp.addEventListener('change', () => on(inp.checked));
  return h('label', { class: 'tv-ctl tv-tog' }, inp, h('span', {}, label));
}
function stats(panel: HTMLElement, defs: [string, string][]) {
  const els: Record<string, HTMLElement> = {};
  const wrap = h('div', { class: 'tv-stats' });
  for (const [k, label] of defs) {
    const b = h('b', {}, '0');
    els[k] = b;
    wrap.append(h('span', { class: 'tv-stat' }, b, ` ${label}`));
  }
  panel.append(wrap);
  return (k: string, v: number) => { const e = els[k]; if (e) e.textContent = String(v); };
}
/** Fires `fn` every `every` seconds of simulated time. */
function ticker(every: number) {
  let acc = 0;
  return { tick(dt: number, fn: () => void) { acc += dt; while (acc >= every) { acc -= every; fn(); } }, reset() { acc = every * 0.9; } };
}
const cls = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ traffic shaping */
function shaping(c: Ctx): Scene {
  const { stage, t } = c;
  let weight = 30, header = true, slow = false, useBreaker = false;
  let r = rng(11);
  const br = new Breaker();
  let now = 0, refresh = 0;
  const st = { attempts: 0, retries: 0, shed: 0 };
  const sp = ticker(0.25);

  const V1: Pt = [308, 52], V2: Pt = [308, 192];
  const toV1: Pt[] = [P, [220, 52], [262, 52]];
  const toV2: Pt[] = [P, [220, 192], [262, 192]];
  c.bg.append(line([U, [100, 122]]), line(toV1), line(toV2, 'tv-hdr'));
  c.bg.append(box(4, 100, 52, 44, 'tv-neutral', t('users')), box(100, 100, 44, 44, 'tv-neutral'), text(122, 126, t('proxy'), 'tv-b tv-sm'));
  const v1R = box(262, 30, 92, 44, 'tv-v1'), v2R = box(262, 170, 92, 44, 'tv-v2');
  const v1T = text(V1[0], V1[1] + 4, '', 'tv-b'), v2T = text(V2[0], V2[1] + 4, '', 'tv-b');
  const hdrT = text(176, 224, t('staffRoute'), 'tv-staff-t opt');
  const brT = text(122, 92, '', 'tv-brk');
  c.bg.append(v1R, v2R, v1T, v2T, hdrT, brT);
  const v2Rect = v2R.firstElementChild!;
  const labels = () => {
    v1T.textContent = `v1 · ${100 - weight}%`;
    v2T.textContent = `v2 · ${weight}%`;
    v2Rect.setAttribute('class', cls('tv-rect tv-v2', slow && 'tv-slow'));
    brT.textContent = useBreaker ? `${t('breaker')}: ${t(br.state === 'closed' ? 'closed' : br.state === 'open' ? 'open' : 'half')}` : '';
    brT.setAttribute('class', cls('tv-t tv-brk', br.state !== 'closed' && 'tv-brk-open'));
  };
  const set = stats(c.panel, [['attempts', t('callsV2')], ['retries', t('retries')], ['shed', t('shed')]]);
  const show = () => { set('attempts', st.attempts); set('retries', st.retries); set('shed', st.shed); labels(); };

  c.controls.append(
    slider(t('share'), 0, 100, 5, weight, (v) => `${v}%`, (v) => { weight = v; labels(); }),
    toggle(t('staffRoute'), header, (v) => { header = v; }),
    toggle(t('slow'), slow, (v) => { slow = v; labels(); }),
    toggle(t('breaker'), useBreaker, (v) => { useBreaker = v; br.reset(); labels(); }),
  );

  const attemptV2 = (depth: number, staff: boolean) => {
    st.attempts++;
    const fail = slow && r() < SLOW_FAIL_RATE;
    stage.fly(toV2, {
      cls: cls(fail ? 'bad' : 'v2', staff && 'staff'), r: staff ? 6 : 4, speed: slow ? 55 : 130,
      onEnd: () => {
        if (useBreaker) br.record(!fail, now);
        if (fail && !useBreaker && depth < MAX_RETRIES) { st.retries++; attemptV2(depth + 1, staff); }
      },
    });
  };
  const decide = (staff: boolean) => {
    const to = route(weight, staff, header, r());
    if (to === 'v1') { stage.fly(toV1, { cls: cls('v1', staff && 'staff'), r: staff ? 6 : 4, speed: 130 }); return; }
    if (useBreaker && !br.allow(now)) { st.shed++; stage.fly([P, [P[0] + 6, P[1] + 30]], { cls: 'shed', speed: 40, fadeEnd: true }); return; }
    attemptV2(0, staff);
  };
  return {
    settle: 6,
    reset() { stage.clear(); r = rng(11); br.reset(); now = 0; refresh = 0; st.attempts = st.retries = st.shed = 0; sp.reset(); show(); },
    step(dt) {
      now += dt;
      sp.tick(dt, () => { const staff = r() < 0.2; stage.fly([U, P], { cls: cls('req', staff && 'staff'), r: staff ? 6 : 4, speed: 150, onEnd: () => decide(staff) }); });
      stage.step(dt);
      refresh += dt; if (refresh > 0.2) { refresh = 0; show(); }
    },
  };
}

/* ------------------------------------------------------------------ shadowing */
function shadowing(c: Ctx): Scene {
  const { stage, t } = c;
  let bug = true;
  let r = rng(5);
  let fx: SideEffects = { stubbed: true, sent: 0, stub: 0 };
  const st = { served: 0, discarded: 0, errors: 0 };
  const sp = ticker(0.5);
  const toV1: Pt[] = [P, [220, 62], [262, 62]];
  const toSh: Pt[] = [P, [220, 172], [262, 172]];
  c.bg.append(line([U, [100, 122]]), line(toV1), line(toSh, 'tv-dash'));
  c.bg.append(box(4, 100, 52, 44, 'tv-neutral', t('users')), box(100, 100, 44, 44, 'tv-neutral'), text(122, 126, t('proxy'), 'tv-b tv-sm'));
  c.bg.append(box(262, 40, 92, 44, 'tv-v1', 'v1'), box(262, 150, 92, 44, 'tv-v2 tv-dashed', t('shadow')));
  c.bg.append(text(354, 212, t('stubbed'), 'tv-mut opt', 'end'));
  c.bg.append(s('rect', { x: 168, y: 204, width: 34, height: 28, rx: 4, class: 'tv-rect tv-neutral' }), line([[164, 204], [206, 204]], 'tv-lid'), text(185, 248, t('bin'), 'tv-mut opt'));
  const set = stats(c.panel, [['served', t('usersSaw')], ['discarded', t('discarded')], ['errors', t('shadowErr')]]);
  const show = () => { set('served', st.served); set('discarded', st.discarded); set('errors', st.errors); };
  c.controls.append(toggle(t('shadowBug'), bug, (v) => { bug = v; }));
  return {
    settle: 6,
    reset() { stage.clear(); r = rng(5); fx = { stubbed: true, sent: 0, stub: 0 }; st.served = st.discarded = st.errors = 0; sp.reset(); show(); },
    step(dt) {
      sp.tick(dt, () => stage.fly([U, P], {
        cls: 'req', speed: 150,
        onEnd: () => {
          stage.fly(toV1, { cls: 'v1', speed: 130, onEnd: () => { stage.fly([[262, 62], [200, 100], [56, 108]], { cls: 'ok', speed: 170, onEnd: () => { st.served++; show(); } }); } });
          stage.fly(toSh, {
            cls: 'copy', speed: 130,
            onEnd: () => {
              const res = shadowCall(fx, bug ? 0.25 : 0, r);
              st.discarded++; if (!res.ok) st.errors++;
              show();
              stage.fly([[262, 172], [200, 190], [185, 206]], { cls: res.ok ? 'copy' : 'bad', speed: 110, fadeEnd: true });
            },
          });
        },
      }));
      stage.step(dt);
    },
  };
}

/* ------------------------------------------------------------------ tap and compare */
const FIELDS = ['id', 'ts', 'price', 'status'];
function tapCompare(c: Ctx): Scene {
  const { stage, t } = c;
  const PT: Pt = [122, 105], UT: Pt = [56, 105];
  const lanes: Record<'a' | 'b' | 'n', { to: Pt[]; back: Pt[]; label: string }> = {
    a: { to: [PT, [210, 35], [270, 35]], back: [[270, 35], [255, 35], [255, 237], [250, 237]], label: t('oldA') },
    b: { to: [PT, [270, 105]], back: [[270, 105], [255, 105], [255, 237], [250, 237]], label: t('oldB') },
    n: { to: [PT, [210, 175], [270, 175]], back: [[270, 175], [255, 175], [255, 237], [250, 237]], label: t('neu') },
  };
  for (const k of ['a', 'b', 'n'] as const) c.bg.append(line(lanes[k].to, 'tv-dash'));
  c.bg.append(box(4, 83, 52, 44, 'tv-neutral', t('users')), box(100, 83, 44, 44, 'tv-neutral'), text(122, 109, t('proxy'), 'tv-b tv-sm'));
  c.bg.append(box(270, 15, 84, 40, 'tv-v1', t('oldA')), box(270, 85, 84, 40, 'tv-v1', t('oldB')), box(270, 155, 84, 40, 'tv-v2', t('neu')), box(150, 222, 100, 30, 'tv-neutral', t('diff')));

  const phase = h('div', { class: 'tv-phase' });
  const rows = new Map<string, { tr: HTMLElement; cells: HTMLElement[]; verdict: HTMLElement }>();
  const tbody = h('tbody');
  for (const f of FIELDS) {
    const cells = [h('td', {}, '–'), h('td', {}, '–'), h('td', {}, '–')];
    const verdict = h('td', { class: 'tv-verdict' }, '');
    const tr = h('tr', {}, h('th', { scope: 'row' }, f), ...cells, verdict);
    rows.set(f, { tr, cells, verdict });
    tbody.append(tr);
  }
  c.panel.append(phase, h('table', { class: 'tv-diff' },
    h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, t('oldA')), h('th', {}, t('oldB')), h('th', {}, t('neu')), h('th', {}, ''))), tbody));

  type Got = { a?: Resp; b?: Resp; n?: Resp };
  let got: Got = {}, hold = -1, cycle = 0;
  const paint = () => {
    const done = got.a && got.b && got.n;
    phase.textContent = done ? t('compare') : t('learn');
    const nz = got.a && got.b ? learnNoise(got.a, got.b) : [];
    const diff = done ? classifyDiff(got.a!, got.n!, nz) : null;
    for (const f of FIELDS) {
      const row = rows.get(f)!;
      [got.a, got.b, got.n].forEach((rsp, i) => { row.cells[i]!.textContent = rsp ? String(rsp[f]) : '–'; });
      let kind = '', label = '';
      if (diff) {
        if (diff.real.includes(f)) { kind = 'real'; label = `≠ ${t('real')}`; }
        else if (diff.noise.includes(f)) { kind = 'noise'; label = t('noise'); }
        else label = t('same');
      } else if (nz.includes(f)) { kind = 'noise'; label = t('noise'); }
      row.tr.className = kind ? `tv-${kind}` : '';
      row.verdict.textContent = label;
    }
  };
  const arrive = (k: 'a' | 'b' | 'n', rsp: Resp) => {
    got[k] = rsp; paint();
    if (got.a && got.b && got.n) hold = 0;
  };
  const start = () => {
    got = {}; hold = -1; paint();
    const base = cycle++ * 3;
    const data = { a: makeResp('old', base), b: makeResp('old', base + 1), n: makeResp('new', base + 2) };
    stage.fly([UT, PT], {
      cls: 'req', speed: 170,
      onEnd: () => {
        for (const k of ['a', 'b', 'n'] as const) {
          stage.fly(lanes[k].to, { cls: 'copy', speed: 150, onEnd: () => { stage.fly(lanes[k].back, { cls: k === 'n' ? 'v2' : 'v1', speed: 170, onEnd: () => arrive(k, data[k]) }); } });
        }
      },
    });
  };
  return {
    settle: 4.5,
    reset() { stage.clear(); cycle = 0; start(); },
    step(dt) {
      stage.step(dt);
      if (hold >= 0) { hold += dt; if (hold > 2.5) start(); }
    },
    finish() { stage.clear(); got = { a: makeResp('old', 0), b: makeResp('old', 1), n: makeResp('new', 2) }; paint(); hold = 0; return 0; },
  };
}

/* ------------------------------------------------------------------ teeing */
function teeing(c: Ctx): Scene {
  const { stage, t } = c;
  const rec = new Recorder(12);
  let n = 0, replayed = 0, replaying = false;
  const sp = ticker(0.6);
  let pending = -1;
  let queue: (() => void) | null = null;
  const PROD: Pt[] = [P, [262, 122]];
  const REPLAY: Pt[] = [[152, 213], [262, 213]];
  c.bg.append(line([U, P]), line(PROD), line([P, [122, 196]], 'tv-dash'), line(REPLAY, 'tv-dash'));
  c.bg.append(box(4, 100, 52, 44, 'tv-neutral', t('users')), box(262, 100, 92, 44, 'tv-v1', t('prod')), box(262, 196, 92, 34, 'tv-v2', t('testDeploy')));
  c.bg.append(s('circle', { cx: 122, cy: 122, r: 8, class: 'tv-rect tv-neutral' }), text(122, 102, t('tee'), 'tv-mut tv-sm'));
  c.bg.append(box(90, 156, 64, 26, 'tv-scrub', t('scrub')), text(162, 173, t('nameMask'), 'tv-mut opt', 'start'));
  c.bg.append(s('rect', { x: 92, y: 196, width: 60, height: 34, rx: 6, class: 'tv-rect tv-tape' }), s('circle', { cx: 108, cy: 213, r: 7, class: 'tv-reel' }), s('circle', { cx: 136, cy: 213, r: 7, class: 'tv-reel' }), line([[108, 224], [136, 224]], 'tv-lid'));
  const recT = text(160, 222, '', 'tv-mut tv-sm opt', 'start');
  c.bg.append(recT);
  const set = stats(c.panel, [['rec', t('recorded')], ['rep', t('replayed')]]);
  const sample = h('code', { class: 'tv-sample' }, '');
  c.panel.append(h('p', { class: 'tv-sampleline' }, h('span', { class: 'muted' }, `${t('lastRec')}: `), sample));
  const btn = h('button', { type: 'button', class: 'btn sm', disabled: true }, t('replayTape'));
  const show = () => { set('rec', rec.tape.length); set('rep', replayed); recT.textContent = rec.tape.length ? `${t('tape')} ${rec.tape.length}` : ''; btn.disabled = replaying || rec.tape.length === 0; };
  const startReplay = () => {
    if (replaying || !rec.tape.length) return;
    replaying = true; replayed = 0; show();
    const items = rec.replay();
    let i = 0;
    const next = () => {
      if (i >= items.length) return;
      i++;
      stage.fly(REPLAY, { cls: 'replay', speed: 140, onEnd: () => { replayed++; if (replayed >= items.length) replaying = false; show(); } });
      pending = 0.22;
      queue = next;
    };
    queue = next; pending = 0;
  };
  btn.addEventListener('click', startReplay);
  c.controls.append(btn);
  return {
    settle: 5,
    reset() { stage.clear(); rec.tape = []; n = 0; replayed = 0; replaying = false; pending = -1; queue = null; sample.textContent = ''; sp.reset(); show(); },
    step(dt) {
      if (rec.tape.length < rec.cap) {
        sp.tick(dt, () => {
          const req = sampleReq(n++);
          stage.fly([U, P], {
            cls: 'req', speed: 150,
            onEnd: () => {
              stage.fly(PROD, { cls: 'v1', speed: 130 });
              stage.fly([P, [122, 169]], { cls: 'copy', speed: 90, onEnd: () => {
                stage.fly([[122, 169], [122, 196]], { cls: 'scrubbed', speed: 90, onEnd: () => { rec.record(req); sample.textContent = `{ name: "${req.name}" } → { name: "${MASK}" }`; show(); } });
              } });
            },
          });
        });
      }
      if (queue) { pending -= dt; if (pending <= 0) { const q = queue; queue = null; q(); } }
      stage.step(dt);
    },
    finish() { startReplay(); return 4; },
  };
}

/* ------------------------------------------------------------------ chaos testing */
function chaos(c: Ctx): Scene {
  const { stage, t } = c;
  let latency = 2.5, fallback = false;
  let sim = new ChaosSim(latency * 1000, fallback);
  let refresh = 0, last = '';
  c.bg.append(line([U, [136, 122]]), line([[236, 122], [270, 122]], 'tv-dash'));
  c.bg.append(box(4, 100, 52, 44, 'tv-neutral', t('users')), box(136, 100, 100, 44, 'tv-v1', t('reserve')), box(270, 100, 84, 44, 'tv-v2', t('payment')));
  const latT = text(312, 166, '', 'tv-warn-t');
  const ths: SVGElement[] = [];
  for (let i = 0; i < POOL; i++) { const r = s('rect', { x: 140 + i * 12, y: 154, width: 10, height: 10, rx: 2, class: 'tv-th' }); ths.push(r); c.bg.append(r); }
  c.bg.append(text(136, 182, t('threads'), 'tv-mut tv-sm opt', 'start'), latT);
  const pageEl = h('span', { class: 'tv-chip' }, '');
  c.panel.append(h('p', { class: 'tv-pagerow' }, h('span', { class: 'muted' }, `${t('page')}: `), pageEl));
  const set = stats(c.panel, [['ok', 'ok'], ['pending', 'pending'], ['failed', 'failed']]);
  const wire = () => {
    sim.hooks = {
      arrive: () => { stage.fly([U, [136, 122]], { cls: 'req', speed: 220 }); },
      done: (o) => { stage.fly([[136, 110], [56, 110]], { cls: o === 'ok' ? 'ok' : o === 'pending' ? 'warn' : 'bad', speed: 220 }); },
    };
  };
  const show = () => {
    ths.forEach((e, i) => e.setAttribute('class', cls('tv-th', i < sim.threads && 'busy', sim.threads >= POOL && i < sim.threads && 'full')));
    latT.textContent = `+${latency.toFixed(1)} s`;
    const p = sim.page;
    pageEl.textContent = t(p === 'ok' ? 'pageOk' : p === 'degraded' ? 'pageDegraded' : 'pageDown');
    pageEl.className = `tv-chip tv-chip-${p}`;
    if (p !== last) { last = p; c.status(`${t('page')}: ${pageEl.textContent}`); }
    set('ok', sim.counts.ok); set('pending', sim.counts.pending); set('failed', sim.counts.failed);
  };
  c.controls.append(
    slider(t('delay'), 0, 3, 0.1, latency, (v) => `${v.toFixed(1)} s`, (v) => { latency = v; sim.latencyMs = v * 1000; show(); }),
    toggle(t('fallback'), fallback, (v) => { fallback = v; sim.fallback = v; }),
  );
  return {
    settle: 7,
    reset() { stage.clear(); sim = new ChaosSim(latency * 1000, fallback); wire(); refresh = 0; last = ''; show(); },
    step(dt) { sim.step(dt); stage.step(dt); refresh += dt; if (refresh > 0.2) { refresh = 0; show(); } },
    finish() { show(); return 0; },
  };
}

/* ------------------------------------------------------------------ dynamic exploration */
const POS: Record<ApiNode, Pt> = { list: [46, 170], get: [132, 92], reserve: [240, 92], cancel: [300, 190], pay: [160, 225] };
const R = 27;
function dynamic(c: Ctx): Scene {
  const { stage, t } = c;
  const res = explore(EXPLORE_SEED);
  const key = (a: ApiNode, b: ApiNode) => `${a}>${b}`;
  const edgePts = (a: ApiNode, b: ApiNode): Pt[] => a === b
    ? [[POS[a][0] - 12, POS[a][1] - 25], [POS[a][0] - 18, POS[a][1] - 46], [POS[a][0], POS[a][1] - 54], [POS[a][0] + 18, POS[a][1] - 46], [POS[a][0] + 12, POS[a][1] - 25]]
    : curve(POS[a], POS[b], 12);
  const edgeEls = new Map<string, SVGElement>();
  for (const [a, b] of API_EDGES) { const e = line(edgePts(a, b), 'tv-edge'); edgeEls.set(key(a, b), e); c.bg.append(e); }
  // OpenAPI spec icon
  c.bg.append(s('rect', { x: 6, y: 6, width: 22, height: 28, rx: 3, class: 'tv-rect tv-neutral' }), line([[11, 15], [23, 15]], 'tv-lid'), line([[11, 21], [23, 21]], 'tv-lid'), line([[11, 27], [19, 27]], 'tv-lid'), text(36, 25, t('spec'), 'tv-mut tv-sm', 'start'));
  const nodeEls = new Map<ApiNode, SVGElement>();
  for (const n of API_NODES) {
    const [x, y] = POS[n];
    const g = s('g', {});
    const ci = s('circle', { cx: x, cy: y, r: R, class: 'tv-rect tv-node' });
    g.append(ci, text(x, y + 4, n, 'tv-b tv-sm'));
    nodeEls.set(n, ci);
    c.bg.append(g);
  }
  const errT = text(POS.reserve[0], POS.reserve[1] + R + 15, '', 'tv-err-t');
  c.bg.append(errT);
  const set = stats(c.panel, [['calls', t('calls')]]);
  const seqEl = h('p', { class: 'tv-seq', hidden: true }, h('span', { class: 'muted' }, `${t('seq')}: `), h('code', {}, BUG_SEQ.join(' → ')), ' ', h('span', { class: 'tv-chip tv-chip-down' }, '500'));
  c.panel.append(seqEl);

  let calls = 0, wait = -1, token = 0;
  const markFound = () => {
    nodeEls.get('reserve')!.setAttribute('class', 'tv-rect tv-node tv-node-err');
    errT.textContent = '500';
    for (let i = res.found - BUG_SEQ.length + 1; i < res.found; i++) edgeEls.get(key(res.steps[i]!, res.steps[i + 1]!))?.setAttribute('class', 'tv-line tv-edge tv-hot');
    seqEl.hidden = false;
    c.status(`500: ${BUG_SEQ.join(' → ')}`);
  };
  const play = (i: number, tk: number) => {
    if (tk !== token) return;
    if (i >= res.found) { markFound(); wait = 0; return; }
    const a = res.steps[i]!, b = res.steps[i + 1]!;
    stage.fly(edgePts(a, b), {
      cls: 'bot', r: 6, speed: 300,
      onEnd: () => {
        if (tk !== token) return;
        edgeEls.get(key(a, b))?.setAttribute('class', 'tv-line tv-edge tv-seen');
        set('calls', ++calls);
        play(i + 1, tk);
      },
    });
  };
  const clearView = () => {
    stage.clear(); calls = 0; wait = -1; token++;
    for (const e of edgeEls.values()) e.setAttribute('class', 'tv-line tv-edge');
    nodeEls.get('reserve')!.setAttribute('class', 'tv-rect tv-node');
    errT.textContent = ''; seqEl.hidden = true; set('calls', 0);
  };
  return {
    settle: 0,
    reset() { clearView(); play(0, token); },
    step(dt) { stage.step(dt); if (wait >= 0) { wait += dt; if (wait > 5) { clearView(); play(0, token); } } },
    finish() {
      clearView();
      for (let i = 0; i < res.found; i++) edgeEls.get(key(res.steps[i]!, res.steps[i + 1]!))?.setAttribute('class', 'tv-line tv-edge tv-seen');
      calls = res.found; set('calls', calls); markFound();
      return 0;
    },
  };
}

export const SCENES: Record<string, (c: Ctx) => Scene> = {
  'traffic-shaping': shaping, shadowing, 'tap-compare': tapCompare, teeing, 'chaos-testing': chaos, 'dynamic-exploration': dynamic,
};
