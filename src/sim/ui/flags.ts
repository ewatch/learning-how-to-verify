import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, segmented, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { USERS, flagOn, flagsOutcome, flagsReport, type Target, type FlagsOutcome } from '../engine/flags';

type FV = FlagsOutcome['values'];
const T = {
  en: {
    intro: 'v2 is already deployed dark behind a feature flag. Enable it for staff, beta, or a share of traffic — then hit the kill switch when an incident strikes.',
    target: 'Flag "reservation-v2" is on for', off: 'nobody', staff: 'staff', beta: 'staff + beta', percent: 'percentage of everyone', pct: 'Percentage',
    incident: 'Simulate an incident in v2', kill: 'Kill switch: turn the flag off', staffL: 'staff', betaL: 'beta', allL: 'everyone else',
    legend: ['v1 (old flow)', 'v2 (new flow)', 'v2 failing'], deployed: 'Deploys so far: 1 (v2 shipped dark). Flag changes are not deploys.',
    stable: 'Same user, same answer: the flag hashes the user id, so a person does not flip between v1 and v2 on every request.',
  },
  de: {
    intro: EXERCISE_DE.flags.intro,
    target: 'Flag „reservation-v2“ ist an für', off: 'niemanden', staff: 'Mitarbeitende', beta: 'Mitarbeitende + Beta', percent: 'Prozentsatz aller', pct: 'Prozentsatz',
    incident: 'Vorfall in v2 simulieren', kill: 'Notschalter: Flag ausschalten', staffL: 'Mitarbeitende', betaL: 'Beta', allL: 'alle anderen',
    legend: ['v1 (alter Ablauf)', 'v2 (neuer Ablauf)', 'v2 scheitert'], deployed: 'Bisherige Deploys: 1 (v2 ausgeschaltet ausgeliefert). Flag-Änderungen sind keine Deploys.',
    stable: 'Gleicher Nutzer, gleiche Antwort: Das Flag hasht die Nutzer-ID, damit niemand bei jeder Anfrage zwischen v1 und v2 wechselt.',
  },
};

const R = {
  en: {
    verdict: {
      'incident-exposed': (v: FV) => `v2 fails for ${v.exposed.total} of ${v.users} users`,
      'incident-dark': (v: FV) => `v2 fails, but 0 of ${v.users} users see it`,
      killed: (v: FV) => `Kill switch: ${v.moved} users are back on v1. 0 new deploys`,
      'killed-none': () => 'Kill switch: the flag is off. Nobody was on v2',
    } as Record<FlagsOutcome['causeId'], (v: FV) => string>,
    why: {
      'incident-exposed': (v: FV) => [`The flag serves v2 to ${v.exposed.staff} staff, ${v.exposed.beta} beta and ${v.exposed.all} other users. All of them get the failing flow.`, `The other ${v.users - v.exposed.total} users stay on v1 and see no failure.`],
      'incident-dark': () => ['v2 is deployed, but the flag is off for everyone. No request reaches the failing code.'],
      killed: (v: FV) => [`The flag changed at runtime from "${v.target}" to off. ${v.moved} users moved from v2 to v1 at once.`, `There was no revert, no build and no deploy. The deploy count is still ${v.deploys}.`],
      'killed-none': () => ['The flag was already off. The kill switch changed nothing.'],
    } as Record<FlagsOutcome['causeId'], (v: FV) => string[]>,
    use: {
      'incident-exposed': 'The agent gets the flag rule and the number of users on the failing flow. It can turn the flag off first and fix v2 later, without a deploy.',
      'incident-dark': 'The agent gets no alert, because no user is on v2. The bug is still in v2. It shows when the flag is turned on.',
      killed: 'The agent gets a clear state: 0 users on v2. It can fix v2 and turn the flag on for staff again.',
      'killed-none': 'The agent gets the same state as before: 0 users on v2.',
    } as Record<FlagsOutcome['causeId'], string>,
    next: {
      'incident-exposed': 'Click **Kill switch: turn the flag off**.',
      'incident-dark': 'Turn the flag on for **staff** and see who gets the failure.',
      killed: 'Turn the flag on for **staff** again. Then simulate the incident with a larger percentage.',
      'killed-none': 'Turn the flag on for **staff + beta** and simulate the incident.',
    } as Record<FlagsOutcome['causeId'], string>,
  },
  de: {
    verdict: {
      'incident-exposed': (v: FV) => `v2 scheitert für ${v.exposed.total} von ${v.users} Nutzern`,
      'incident-dark': (v: FV) => `v2 scheitert, aber 0 von ${v.users} Nutzern sehen es`,
      killed: (v: FV) => `Notschalter: ${v.moved} Nutzer sind zurück auf v1. 0 neue Deploys`,
      'killed-none': () => 'Notschalter: Das Flag ist aus. Niemand war auf v2',
    } as Record<FlagsOutcome['causeId'], (v: FV) => string>,
    why: {
      'incident-exposed': (v: FV) => [`Das Flag liefert v2 an ${v.exposed.staff} Mitarbeitende, ${v.exposed.beta} Beta- und ${v.exposed.all} andere Nutzer. Alle bekommen den scheiternden Ablauf.`, `Die anderen ${v.users - v.exposed.total} Nutzer bleiben auf v1 und sehen keinen Fehler.`],
      'incident-dark': () => ['v2 ist deployt, aber das Flag ist für alle aus. Keine Anfrage erreicht den scheiternden Code.'],
      killed: (v: FV) => [`Das Flag wechselte zur Laufzeit von „${v.target}“ auf aus. ${v.moved} Nutzer wechselten sofort von v2 zu v1.`, `Es gab keinen Revert, keinen Build und keinen Deploy. Die Zahl der Deploys ist weiter ${v.deploys}.`],
      'killed-none': () => ['Das Flag war schon aus. Der Notschalter hat nichts geändert.'],
    } as Record<FlagsOutcome['causeId'], (v: FV) => string[]>,
    use: {
      'incident-exposed': 'Der Agent bekommt die Flag-Regel und die Zahl der Nutzer auf dem scheiternden Ablauf. Er kann zuerst das Flag ausschalten und v2 später beheben, ohne Deploy.',
      'incident-dark': 'Der Agent bekommt keinen Alarm, weil kein Nutzer auf v2 ist. Der Fehler steckt weiter in v2. Er zeigt sich, wenn das Flag eingeschaltet wird.',
      killed: 'Der Agent bekommt einen klaren Zustand: 0 Nutzer auf v2. Er kann v2 beheben und das Flag wieder für Mitarbeitende einschalten.',
      'killed-none': 'Der Agent bekommt denselben Zustand wie vorher: 0 Nutzer auf v2.',
    } as Record<FlagsOutcome['causeId'], string>,
    next: {
      'incident-exposed': '**Notschalter: Flag ausschalten** klicken.',
      'incident-dark': 'Das Flag für **Mitarbeitende** einschalten und sehen, wer den Fehler bekommt.',
      killed: 'Das Flag wieder für **Mitarbeitende** einschalten. Dann den Vorfall mit einem größeren Prozentsatz simulieren.',
      'killed-none': 'Das Flag für **Mitarbeitende + Beta** einschalten und den Vorfall simulieren.',
    } as Record<FlagsOutcome['causeId'], string>,
  },
};

/** Map the engine outcome to panel text. */
export function flagsView(o: FlagsOutcome, lang: Lang): ResultView {
  const r = R[lang], c = o.causeId;
  const v = { ...o.values, target: (T[lang][o.values.target] as string) } as FV;
  return { status: o.status, verdict: r.verdict[c](v), why: r.why[c](v), agent: { tool: lang === 'en' ? 'flag service log (neutral format)' : 'Log des Flag-Dienstes (neutrales Format)', output: flagsReport(o), use: r.use[c] }, next: r.next[c] };
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { target: 'off' as Target, pct: 10, incident: false, killedFrom: null as null | { target: Target; pct: number } };
  const grid = h('div', { style: 'display:grid;grid-template-columns:repeat(20,1fr);gap:4px;max-width:520px' });
  const pctInput = h('input', { type: 'range', min: 0, max: 100, step: 5, value: S.pct, 'aria-label': t.pct, oninput: (e: Event) => { S.pct = Number((e.target as HTMLInputElement).value); pctLabel.textContent = `${S.pct}%`; S.killedFrom = null; render(); } });
  const pctLabel = h('span', {}, `${S.pct}%`);
  const pctRow = h('label', { class: 'inline', hidden: true }, t.pct, pctInput, pctLabel);
  const panel = resultPanel(lang);
  const seg = h('div');
  const killBtn = h('button', { class: 'btn', type: 'button', style: 'background:var(--bad);border-color:var(--bad)', onclick: () => kill() }, `⏻ ${t.kill}`);

  const on = (u: (typeof USERS)[number]) => flagOn(u, S.target, S.pct);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, seg),
    pctRow,
    h('div', { class: 'sim-row' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => { S.incident = true; S.killedFrom = null; render(); } }, `⚡ ${t.incident} `, roleTag('bug', lang)), killBtn),
    h('div', { class: 'sim-card' },
      h('div', { class: 'sim-row small muted', style: 'margin-bottom:8px' },
        ...[['var(--ink-3)', t.legend[0]], ['var(--l-verification)', t.legend[1]], ['var(--bad)', t.legend[2]]].map(([c, l]) => h('span', { class: 'inline' }, h('i', { style: `display:inline-block;width:12px;height:12px;border-radius:3px;background:${c}` }), l))),
      grid,
      h('p', { class: 'small muted', style: 'margin:8px 0 0' }, `■ 1–5: ${t.staffL} · 6–20: ${t.betaL} · 21–100: ${t.allL}`)),
    panel.el,
    h('p', { class: 'small muted', style: 'margin:0' }, t.deployed, ' ', t.stable),
  ));

  function renderSeg() {
    seg.replaceChildren(segmented(t.target, (['off', 'staff', 'beta', 'percent'] as Target[]).map((v) => ({ value: v, label: t[v] })), S.target, (v) => { S.target = v; pctRow.hidden = v !== 'percent'; S.killedFrom = null; render(); }));
  }

  function render() {
    grid.replaceChildren(...USERS.map((u) => {
      const v2 = on(u);
      const c = v2 ? (S.incident ? 'var(--bad)' : 'var(--l-verification)') : 'var(--ink-3)';
      return h('span', { title: `#${u.id + 1} ${u.seg}: ${v2 ? 'v2' : 'v1'}`, style: `aspect-ratio:1;border-radius:3px;background:${c};opacity:${u.seg === 'all' ? 0.85 : 1};outline:${u.seg !== 'all' ? '1.5px solid var(--ink)' : 'none'}` });
    }));
    const o = flagsOutcome(S);
    if (o) panel.show(flagsView(o, lang)); else panel.clear();
  }

  function kill() {
    S.killedFrom = { target: S.target, pct: S.pct };
    S.target = 'off'; S.incident = false; pctRow.hidden = true;
    renderSeg(); render();
  }
  renderSeg(); render();
}
