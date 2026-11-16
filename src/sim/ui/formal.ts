import { h, segmented, sleep, reducedMotion, type Lang } from './kit';
import { modelCheck, type Step } from '../engine/modelcheck';
import adopt from '../../../guides-src/tla/Adopt.tla?raw';
import adoptFixed from '../../../guides-src/tla/AdoptFixed.tla?raw';

const NAMES = ['Anna', 'Ben', 'Cem', 'Dana'];
const T = {
  en: {
    intro: 'Tests try some orders of events. A model checker tries all of them. Here several people try to reserve Rex at the same time. Choose how the app works and let the checker explore every possible interleaving.',
    design: 'Design', twoSteps: 'Check, then reserve (two requests)', atomic: 'Check and reserve in one step (server-side)', people: 'People',
    run: 'Check all interleavings', spec: 'The same model in TLA+', explored: (d: number, g: number) => `${d} distinct states explored (${g} generated)`,
    ok: (d: number) => `✓ No error: in all ${d} reachable states, Rex has at most one owner. This holds for every possible order of steps, not just the ones a test happened to try.`,
    bad: '✗ Invariant violated: Rex is reserved by two people. Shortest path to the bug:',
    actions: { check: 'checks: Rex is free', reserve: 'reserves Rex', checkAndReserve: 'checks and reserves' },
    owner: 'owners', none: 'nobody', step: 'Step', init: 'Start',
    lesson: (people: number) => `A unit test would need to hit exactly this interleaving by luck. The checker found it by brute force on a model with ${people} people; with the atomic design it proves there is no such path.`,
  },
  de: {
    intro: 'Tests probieren einige Reihenfolgen von Ereignissen. Ein Model Checker probiert alle. Hier versuchen mehrere Personen gleichzeitig, Rex zu reservieren. Wähle, wie die App arbeitet, und lass den Checker jede mögliche Verschränkung erkunden.',
    design: 'Entwurf', twoSteps: 'Prüfen, dann reservieren (zwei Anfragen)', atomic: 'Prüfen und reservieren in einem Schritt (Server)', people: 'Personen',
    run: 'Alle Verschränkungen prüfen', spec: 'Dasselbe Modell in TLA+', explored: (d: number, g: number) => `${d} verschiedene Zustände erkundet (${g} erzeugt)`,
    ok: (d: number) => `✓ Kein Fehler: In allen ${d} erreichbaren Zuständen hat Rex höchstens einen Besitzer. Das gilt für jede mögliche Reihenfolge der Schritte, nicht nur für die, die ein Test zufällig probierte.`,
    bad: '✗ Invariante verletzt: Rex ist von zwei Personen reserviert. Kürzester Weg zum Fehler:',
    actions: { check: 'prüft: Rex ist frei', reserve: 'reserviert Rex', checkAndReserve: 'prüft und reserviert' },
    owner: 'Besitzer', none: 'niemand', step: 'Schritt', init: 'Start',
    lesson: (people: number) => `Ein Unit-Test müsste genau diese Verschränkung zufällig treffen. Der Checker fand sie per Durchsuchen eines Modells mit ${people} Personen; mit dem atomaren Entwurf beweist er, dass es keinen solchen Weg gibt.`,
  },
};

function mountModelCheck(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { atomic: false, people: 2, run: 0 };
  const spec = h('pre', { tabindex: 0, class: 'sim-code', style: 'padding:8px 12px;max-height:320px' });
  const counter = h('div', { class: 'small muted', 'aria-live': 'polite' });
  const out = h('div');
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: () => run() }, t.run);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, segmented(t.design, [{ value: 'two', label: t.twoSteps }, { value: 'atomic', label: t.atomic }], 'two', (v) => { S.atomic = v === 'atomic'; render(); })),
    h('div', { class: 'sim-row' }, segmented(t.people, ['2', '3', '4'].map((x) => ({ value: x, label: x })), '2', (v) => { S.people = Number(v); render(); })),
    h('div', { class: 'sim-row' }, runBtn, counter),
    out,
    h('details', { class: 'disclose' }, h('summary', {}, t.spec), h('div', { class: 'body' }, spec)),
  ));

  function render() { S.run++; runBtn.disabled = false; out.replaceChildren(); counter.textContent = ''; spec.textContent = (S.atomic ? adoptFixed : adopt).trim(); }

  function lane(trace: Step[]) {
    const people = NAMES.slice(0, S.people);
    const table = h('table', { class: 'sim-table' });
    table.append(h('thead', {}, h('tr', {}, h('th', {}, t.step), ...people.map((n) => h('th', {}, n)), h('th', {}, t.owner))));
    const body = h('tbody');
    body.append(h('tr', {}, h('td', {}, t.init), ...people.map(() => h('td', { class: 'muted' }, '·')), h('td', {}, t.none)));
    trace.forEach((s, i) => {
      const owners = s.state.owners.map((o) => NAMES[o]).join(', ') || t.none;
      body.append(h('tr', { class: i === trace.length - 1 ? 'cur' : '' }, h('td', {}, String(i + 1)), ...people.map((_, p) => h('td', {}, p === s.actor ? h('strong', {}, t.actions[s.action]) : '')), h('td', { style: s.state.owners.length > 1 ? 'color:var(--bad);font-weight:700' : '' }, owners)));
    });
    table.append(body);
    return table;
  }

  async function run() {
    S.run++;
    const id = S.run;
    runBtn.disabled = true;
    out.replaceChildren();
    const r = modelCheck({ people: S.people, atomic: S.atomic });
    if (!reducedMotion()) {
      for (let i = 1; i <= r.order.length; i += Math.max(1, Math.floor(r.order.length / 25))) {
        if (id !== S.run) return;
        counter.textContent = t.explored(i, i);
        await sleep(30);
      }
    }
    if (id !== S.run) return;
    counter.textContent = t.explored(r.distinct, r.generated);
    if (r.violation) out.replaceChildren(h('div', { class: 'sim-callout bad' }, h('p', {}, h('strong', {}, t.bad))), lane(r.violation.trace), h('p', { class: 'sim-hint' }, t.lesson(S.people)));
    else out.replaceChildren(h('div', { class: 'sim-callout ok' }, t.ok(r.distinct)));
    runBtn.disabled = false;
  }
  render();
}

const TABS = {
  en: { label: 'Formal verification simulators', names: ['Model checking', 'wp calculus', 'Loop invariants (Dafny)', 'Lean 4 proof'] },
  de: { label: 'Simulatoren zur formalen Verifikation', names: ['Model Checking', 'wp-Kalkül', 'Schleifeninvarianten (Dafny)', 'Lean-4-Beweis'] },
};
const LOADERS: ((el: HTMLElement, lang: Lang) => void | Promise<void>)[] = [
  mountModelCheck,
  async (el, lang) => (await import('./wp')).mount(el, lang),
  async (el, lang) => (await import('./invariant')).mount(el, lang),
  async (el, lang) => (await import('./lean')).mount(el, lang),
];

export function mount(root: HTMLElement, lang: Lang) {
  const names = TABS[lang].names;
  const uid = Math.random().toString(36).slice(2);
  const mounted = new Set<number>();
  const tabs: HTMLElement[] = [];
  const panels: HTMLElement[] = [];
  const list = h('div', { class: 'sim-tabs', role: 'tablist', 'aria-label': TABS[lang].label });

  function select(i: number, focus = false, reveal = true) {
    tabs.forEach((tab, k) => {
      tab.setAttribute('aria-selected', String(k === i));
      tab.tabIndex = k === i ? 0 : -1;
      // Inactive panels stay findable (Ctrl+F reveals them via beforematch); browsers without until-found just hide them.
      if (k === i) panels[k]!.removeAttribute('hidden'); else panels[k]!.setAttribute('hidden', 'until-found');
    });
    if (focus) tabs[i]!.focus();
    // keep the selected tab visible in the scrolling tablist, without scrolling the page
    if (reveal) tabs[i]!.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' } as ScrollIntoViewOptions);
    if (!mounted.has(i)) { mounted.add(i); void LOADERS[i]!(panels[i]!, lang); }
  }
  names.forEach((name, i) => {
    const tab = h('button', {
      class: 'sim-tab', type: 'button', role: 'tab', id: `${uid}-tab-${i}`, 'aria-selected': 'false', tabindex: -1,
      onclick: () => select(i),
      onkeydown: (ev: Event) => {
        const k = (ev as KeyboardEvent).key;
        const to = k === 'ArrowRight' ? (i + 1) % names.length : k === 'ArrowLeft' ? (i + names.length - 1) % names.length : k === 'Home' ? 0 : k === 'End' ? names.length - 1 : -1;
        if (to >= 0) { ev.preventDefault(); select(to, true); }
      },
    }, name);
    tabs.push(tab);
    panels.push(h('div', { role: 'tabpanel', id: `${uid}-panel-${i}`, 'aria-labelledby': `${uid}-tab-${i}`, hidden: 'until-found', onbeforematch: () => select(i) }));
    list.append(tab);
  });
  root.append(list, ...panels);
  select(0, false, false);
}
