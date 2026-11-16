import { h, segmented, type Lang } from './kit';

type Target = 'off' | 'staff' | 'beta' | 'percent';
const T = {
  en: {
    intro: 'The new reservation flow (v2) is already deployed, switched off. A feature flag decides at runtime who sees it. Turn it on for staff, then beta users, then a percentage of everyone. When v2 starts failing, hit the kill switch: no deploy, no rollback, one click.',
    target: 'Flag "reservation-v2" is on for', off: 'nobody', staff: 'staff', beta: 'staff + beta', percent: 'percentage of everyone', pct: 'Percentage',
    incident: 'Simulate an incident in v2', kill: 'Kill switch: turn the flag off', staffL: 'staff', betaL: 'beta', allL: 'everyone else',
    legend: ['v1 (old flow)', 'v2 (new flow)', 'v2 failing'], deployed: 'Deploys so far: 1 (v2 shipped dark). Flag changes are not deploys.',
    killed: (n: number) => `Kill switch used: ${n} users were moved back to v1 instantly. Without a flag this would have been a revert, a build and a deploy.`,
    stable: 'Same user, same answer: the flag hashes the user id, so a person does not flip between v1 and v2 on every request.',
  },
  de: {
    intro: 'Der neue Reservierungsablauf (v2) ist bereits deployt, aber ausgeschaltet. Ein Feature Flag entscheidet zur Laufzeit, wer ihn sieht. Schalte ihn für Mitarbeitende ein, dann für Beta-Nutzer, dann für einen Prozentsatz aller. Wenn v2 zu scheitern beginnt, drück den Notschalter: kein Deploy, kein Zurückrollen, ein Klick.',
    target: 'Flag „reservation-v2“ ist an für', off: 'niemanden', staff: 'Mitarbeitende', beta: 'Mitarbeitende + Beta', percent: 'Prozentsatz aller', pct: 'Prozentsatz',
    incident: 'Vorfall in v2 simulieren', kill: 'Notschalter: Flag ausschalten', staffL: 'Mitarbeitende', betaL: 'Beta', allL: 'alle anderen',
    legend: ['v1 (alter Ablauf)', 'v2 (neuer Ablauf)', 'v2 scheitert'], deployed: 'Bisherige Deploys: 1 (v2 ausgeschaltet ausgeliefert). Flag-Änderungen sind keine Deploys.',
    killed: (n: number) => `Notschalter genutzt: ${n} Nutzer wurden sofort zu v1 zurückgeleitet. Ohne Flag wäre das ein Revert, ein Build und ein Deploy gewesen.`,
    stable: 'Gleicher Nutzer, gleiche Antwort: Das Flag hasht die Nutzer-ID, damit niemand bei jeder Anfrage zwischen v1 und v2 wechselt.',
  },
};

interface User { id: number; seg: 'staff' | 'beta' | 'all'; bucket: number }
const USERS: User[] = Array.from({ length: 100 }, (_, i) => ({ id: i, seg: i < 5 ? 'staff' : i < 20 ? 'beta' : 'all', bucket: (i * 37 + 11) % 100 }));

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { target: 'off' as Target, pct: 10, incident: false };
  const grid = h('div', { style: 'display:grid;grid-template-columns:repeat(20,1fr);gap:4px;max-width:520px' });
  const pctInput = h('input', { type: 'range', min: 0, max: 100, step: 5, value: S.pct, 'aria-label': t.pct, oninput: (e: Event) => { S.pct = Number((e.target as HTMLInputElement).value); pctLabel.textContent = `${S.pct}%`; render(); } });
  const pctLabel = h('span', {}, `${S.pct}%`);
  const pctRow = h('label', { class: 'inline', hidden: true }, t.pct, pctInput, pctLabel);
  const note = h('div', { class: 'sim-callout', hidden: true });
  const seg = h('div');
  const killBtn = h('button', { class: 'btn', type: 'button', style: 'background:var(--bad);border-color:var(--bad)', onclick: () => kill() }, `⏻ ${t.kill}`);

  const on = (u: User) => S.target === 'staff' ? u.seg === 'staff' : S.target === 'beta' ? u.seg !== 'all' : S.target === 'percent' ? u.seg !== 'all' || u.bucket < S.pct : false;

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, h('span', { class: 'small muted' }, t.target), seg),
    pctRow,
    h('div', { class: 'sim-row' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => { S.incident = true; render(); } }, `⚡ ${t.incident}`), killBtn),
    h('div', { class: 'sim-card' },
      h('div', { class: 'sim-row small muted', style: 'margin-bottom:8px' },
        ...[['var(--ink-3)', t.legend[0]], ['var(--l-verification)', t.legend[1]], ['var(--bad)', t.legend[2]]].map(([c, l]) => h('span', { class: 'inline' }, h('i', { style: `display:inline-block;width:12px;height:12px;border-radius:3px;background:${c}` }), l))),
      grid,
      h('p', { class: 'small muted', style: 'margin:8px 0 0' }, `■ 1–5: ${t.staffL} · 6–20: ${t.betaL} · 21–100: ${t.allL}`)),
    note,
    h('p', { class: 'small muted', style: 'margin:0' }, t.deployed, ' ', t.stable),
  ));

  function renderSeg() {
    seg.replaceChildren(segmented(t.target, (['off', 'staff', 'beta', 'percent'] as Target[]).map((v) => ({ value: v, label: t[v] })), S.target, (v) => { S.target = v; pctRow.hidden = v !== 'percent'; note.hidden = true; render(); }));
  }

  function render() {
    grid.replaceChildren(...USERS.map((u) => {
      const v2 = on(u);
      const c = v2 ? (S.incident ? 'var(--bad)' : 'var(--l-verification)') : 'var(--ink-3)';
      return h('span', { title: `#${u.id + 1} ${u.seg}: ${v2 ? 'v2' : 'v1'}`, style: `aspect-ratio:1;border-radius:3px;background:${c};opacity:${u.seg === 'all' ? 0.85 : 1};outline:${u.seg !== 'all' ? '1.5px solid var(--ink)' : 'none'}` });
    }));
  }

  function kill() {
    const n = USERS.filter(on).length;
    S.target = 'off'; S.incident = false; pctRow.hidden = true;
    renderSeg(); render();
    note.hidden = false; note.className = 'sim-callout ok'; note.textContent = t.killed(n);
  }
  renderSeg(); render();
}
