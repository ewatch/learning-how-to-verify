import { h, codeView, codeEditor, pill, sleep, reducedMotion, type Lang } from './kit';
import { runWithCoverage } from '../engine/jsrun';
import { generateMutants, runMutant, mutationScore, type MutantKind, type MutantResult } from '../engine/mutate';

const fakeRepo = () => ({ saved: [] as unknown[], save(x: unknown) { this.saved.push(x); } });
const fakeMailer = () => ({ sent: [] as unknown[], send(to: string, text: string) { this.sent.push({ to, text }); } });
const EXTRA = { fakeRepo, fakeMailer };

interface Example { name: Record<Lang, string>; explain: Record<Lang, string>; code: string; tests: string; better?: string; equivalent?: Record<string, Record<Lang, string>> }

export const EXAMPLES: Example[] = [
  {
    name: { en: 'Fee: boundaries', de: 'Gebühr: Grenzwerte' },
    explain: {
      en: 'Senior pets (8 years or older) cost half. The tests cover <b>100% of the lines</b> and look complete. Run mutation testing and watch which mutants survive.',
      de: 'Senioren (ab 8 Jahren) kosten die Hälfte. Die Tests decken <b>100 % der Zeilen</b> ab und wirken vollständig. Starte das Mutation Testing und achte darauf, welche Mutanten überleben.',
    },
    code: `function adoptionFee(ageYears) {
  if (ageYears >= 8) {
    return 6000;
  }
  return 12000;
}`,
    tests: `test("a 3-year-old pays the full fee", () => {
  expect(adoptionFee(3)).toBe(12000);
});

test("a 10-year-old pays half", () => {
  expect(adoptionFee(10)).toBe(6000);
});`,
    better: `test("a 3-year-old pays the full fee", () => {
  expect(adoptionFee(3)).toBe(12000);
});

test("a 10-year-old pays half", () => {
  expect(adoptionFee(10)).toBe(6000);
});

test("boundary: exactly 8 pays half", () => {
  expect(adoptionFee(8)).toBe(6000);
});

test("boundary: 7 pays the full fee", () => {
  expect(adoptionFee(7)).toBe(12000);
});`,
  },
  {
    name: { en: 'Reserve: weak assertions', de: 'Reservieren: schwache Assertions' },
    explain: {
      en: 'Typical business code with side effects. The test calls the function but checks almost nothing: whether the pet is marked, saved, or the person notified goes unnoticed. The error case is not tested at all.',
      de: 'Typischer Fachcode mit Seiteneffekten. Der Test ruft die Funktion auf, prüft aber fast nichts: Ob das Tier markiert, gespeichert oder die Person benachrichtigt wird, merkt niemand. Der Fehlerfall wird gar nicht getestet.',
    },
    code: `function reserve(pet, person, repo, mailer) {
  if (pet.reservedBy) {
    throw new Error("already reserved");
  }
  pet.reservedBy = person;
  repo.save(pet);
  mailer.send(person, "Reserved: " + pet.name);
  return pet;
}`,
    tests: `test("reserving works", () => {
  const pet = { name: "Rex" };
  const result = reserve(pet, "anna", fakeRepo(), fakeMailer());
  expect(result).toBeDefined();
});`,
    better: `test("reserve marks, saves and notifies", () => {
  const repo = fakeRepo(), mailer = fakeMailer();
  const pet = { name: "Rex" };
  const result = reserve(pet, "anna", repo, mailer);
  expect(result).toBe(pet);
  expect(pet.reservedBy).toBe("anna");
  expect(repo.saved).toEqual([pet]);
  expect(mailer.sent).toEqual([{ to: "anna", text: "Reserved: Rex" }]);
});

test("a reserved pet cannot be reserved again", () => {
  const pet = { name: "Rex", reservedBy: "anna" };
  expect(() => reserve(pet, "ben", fakeRepo(), fakeMailer())).toThrow("already reserved");
});`,
  },
  {
    name: { en: 'Oldest pet: equivalent mutants', de: 'Ältestes Tier: äquivalente Mutanten' },
    explain: {
      en: 'These tests are actually good. Still, two mutants survive because they behave <b>exactly like the original</b>. No test can kill such <b>equivalent mutants</b>; a human has to recognise and mark them. One <code>i--</code> mutant loops forever; it is caught by a timeout and counts as killed.',
      de: 'Diese Tests sind eigentlich gut. Trotzdem überleben zwei Mutanten, weil sie sich <b>exakt wie das Original</b> verhalten. Solche <b>äquivalenten Mutanten</b> kann kein Test töten; ein Mensch muss sie erkennen und markieren. Ein <code>i--</code>-Mutant läuft endlos; ein Timeout fängt ihn, und er zählt als getötet.',
    },
    code: `function oldestAge(ages) {
  let max = ages[0];
  for (let i = 1; i < ages.length; i++) {
    if (ages[i] > max) {
      max = ages[i];
    }
  }
  return max;
}`,
    tests: `test("oldest in the middle", () => {
  expect(oldestAge([1, 5, 2])).toBe(5);
});

test("oldest first", () => {
  expect(oldestAge([9, 1, 2])).toBe(9);
});

test("oldest last", () => {
  expect(oldestAge([2, 3, 12])).toBe(12);
});`,
    equivalent: {
      '3:<→<=': { en: 'At i == ages.length, ages[i] is undefined, and undefined > max is always false. Same behaviour.', de: 'Bei i == ages.length ist ages[i] undefined, und undefined > max ist immer false. Gleiches Verhalten.' },
      '4:>→>=': { en: 'On a tie, max is replaced by the same value. Same result.', de: 'Bei Gleichstand wird max durch denselben Wert ersetzt. Gleiches Ergebnis.' },
    },
  },
];

const HINTS: Record<MutantKind, Record<Lang, string>> = {
  'rel-boundary': { en: 'Boundary not tested: a test with exactly the boundary value is missing.', de: 'Grenze nicht getestet: Ein Test mit genau dem Grenzwert fehlt.' },
  'rel-negate': { en: 'No test checks this condition effectively.', de: 'Kein Test prüft diese Bedingung wirksam.' },
  eq: { en: 'No test checks this condition effectively.', de: 'Kein Test prüft diese Bedingung wirksam.' },
  arith: { en: 'No test checks the result of this calculation exactly.', de: 'Kein Test prüft das Ergebnis dieser Berechnung exakt.' },
  logic: { en: 'The combination of sub-conditions is untested.', de: 'Die Kombination der Teilbedingungen ist ungetestet.' },
  update: { en: 'The loop control is not checked.', de: 'Die Schleifensteuerung wird nicht geprüft.' },
  num: { en: 'No test pins down the exact value of this constant.', de: 'Kein Test legt den genauen Wert dieser Konstante fest.' },
  str: { en: 'No test checks this text (status, error message, mail content …).', de: 'Kein Test prüft diesen Text (Status, Fehlermeldung, Mail-Inhalt …).' },
  bool: { en: 'No test checks this boolean.', de: 'Kein Test prüft diesen Wahrheitswert.' },
  'if-true': { en: 'The case "condition is false" is not checked by any test.', de: 'Der Fall „Bedingung ist falsch“ wird von keinem Test geprüft.' },
  'if-false': { en: 'The case "condition is true" is not checked by any test with an assertion (missing error-case test?).', de: 'Der Fall „Bedingung ist wahr“ wird von keinem Test mit Assertion geprüft (fehlender Fehlerfall-Test?).' },
  ret: { en: 'No test checks the return value.', de: 'Kein Test prüft den Rückgabewert.' },
  del: { en: 'No test notices if this statement is missing; its side effect is unchecked.', de: 'Kein Test merkt, wenn diese Anweisung fehlt; ihr Seiteneffekt ist ungeprüft.' },
};

const T = {
  en: { run: 'Run mutation testing', running: 'Running…', better: 'Load better tests', reset: 'Reset tests', editCode: 'Edit code', editTests: 'Edit tests', done: 'Done editing', code: 'Code under test', tests: 'Tests', coverage: 'Line coverage', score: 'Mutation score', mutants: 'Mutants', killed: 'killed', survived: 'survived', timeout: 'timeout (killed)', invalid: 'does not compile', equivalent: 'equivalent', markEq: 'mark as equivalent', unmarkEq: 'equivalent (undo)', by: 'killed by', isEq: 'Is there any input for which this mutant behaves differently from the original? If not, it is equivalent.', notStarted: 'Not started yet.', mustPass: 'The tests must pass on the original code first. Failing:', noTests: 'The test suite contains no tests.', summaryGood: 'Every non-equivalent mutant was killed. These tests really check the behaviour.', summaryBad: (n: number) => `${n} mutant${n === 1 ? '' : 's'} survived although coverage says the lines ran. Each survivor points at a missing test.`, click: 'Click a row to see the change.', col: ['#', 'Line', 'Change', 'Status'] },
  de: { run: 'Mutation Testing starten', running: 'Läuft …', better: 'Bessere Tests laden', reset: 'Tests zurücksetzen', editCode: 'Code bearbeiten', editTests: 'Tests bearbeiten', done: 'Fertig', code: 'Getesteter Code', tests: 'Tests', coverage: 'Zeilenabdeckung', score: 'Mutation Score', mutants: 'Mutanten', killed: 'getötet', survived: 'überlebt', timeout: 'Timeout (getötet)', invalid: 'kompiliert nicht', equivalent: 'äquivalent', markEq: 'als äquivalent markieren', unmarkEq: 'äquivalent (zurücknehmen)', by: 'getötet durch', isEq: 'Gibt es überhaupt eine Eingabe, bei der sich dieser Mutant anders verhält als das Original? Wenn nicht, ist er äquivalent.', notStarted: 'Noch nicht gestartet.', mustPass: 'Die Tests müssen zuerst auf dem Originalcode grün sein. Fehlgeschlagen:', noTests: 'Die Testsuite enthält keine Tests.', summaryGood: 'Jeder nicht äquivalente Mutant wurde getötet. Diese Tests prüfen das Verhalten wirklich.', summaryBad: (n: number) => `${n} Mutant${n === 1 ? '' : 'en'} überlebt${n === 1 ? '' : 'en'}, obwohl die Abdeckung sagt, dass die Zeilen liefen. Jeder Überlebende zeigt auf einen fehlenden Test.`, click: 'Zeile anklicken, um die Änderung zu sehen.', col: ['#', 'Zeile', 'Änderung', 'Status'] },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { ex: 0, code: '', tests: '', results: [] as MutantResult[], eq: new Set<number>(), cov: null as null | { lines: number[]; hit: Set<number>; pct: number }, run: 0, sel: -1, editing: '' as '' | 'code' | 'tests' };

  const exBar = h('div', { class: 'sim-row', role: 'group', 'aria-label': lang === 'en' ? 'Examples' : 'Beispiele' });
  const explain = h('p', { class: 'sim-intro' });
  const runBtn = h('button', { class: 'btn', type: 'button' }, t.run);
  const betterBtn = h('button', { class: 'btn ghost', type: 'button' }, t.better);
  const resetBtn = h('button', { class: 'btn ghost', type: 'button' }, t.reset);
  const codeBox = h('div');
  const testBox = h('div');
  const codeEditBtn = h('button', { class: 'btn ghost sm', type: 'button' }, t.editCode);
  const testEditBtn = h('button', { class: 'btn ghost sm', type: 'button' }, t.editTests);
  const covVal = h('b', {}, '–'), covBar = h('i', { style: 'width:0' });
  const scoreVal = h('b', {}, '–'), scoreBar = h('i', { style: 'width:0' });
  const summary = h('div', { class: 'sim-callout', hidden: true });
  const tbody = h('tbody');
  const detail = h('div');

  const metric = (label: string, val: HTMLElement, bar: HTMLElement, c: string) =>
    h('div', { class: 'sim-metric' }, h('span', {}, label), val, h('div', { class: 'sim-meter', style: `--c:${c}` }, bar));

  root.append(h('div', { class: 'sim' },
    exBar, explain,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.code, codeEditBtn), codeBox),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.tests, testEditBtn), testBox),
    ),
    h('div', { class: 'sim-row' }, runBtn, betterBtn, resetBtn),
    h('div', { class: 'sim-row' }, metric(t.coverage, covVal, covBar, 'var(--l-static)'), metric(t.score, scoreVal, scoreBar, 'var(--ok)')),
    summary,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.mutants, h('span', { class: 'small muted', style: 'text-transform:none;letter-spacing:0;font-weight:400' }, t.click)),
        h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, ...t.col.map((c) => h('th', {}, c)))), tbody)),
      detail,
    ),
  ));

  EXAMPLES.forEach((ex, i) => exBar.append(h('button', { class: 'btn ghost sm', type: 'button', 'aria-pressed': String(i === 0), onclick: () => load(i) }, ex.name[lang])));

  const eqKey = (r: MutantResult) => `${r.mutant.line + 1}:${r.mutant.desc.replace(/\s/g, '')}`;

  function renderCode() {
    if (S.editing === 'code') return;
    const sel = S.results.find((r) => r.mutant.id === S.sel);
    const marks = S.cov ? S.cov.lines.map((l) => ({ line: l, cls: S.cov!.hit.has(l) ? 'cov1' : 'cov0' })) : [];
    codeBox.replaceChildren(codeView(S.code, marks, sel ? { line: sel.mutant.line, code: sel.mutant.code } : undefined));
  }
  function renderTests() { if (S.editing !== 'tests') testBox.replaceChildren(codeView(S.tests)); }

  function status(r: MutantResult) {
    if (r.status === 'killed') return pill('ok', `✓ ${t.killed}`);
    if (r.status === 'timeout') return pill('ok', `⏱ ${t.timeout}`);
    if (r.status === 'invalid') return pill('idle', t.invalid);
    return S.eq.has(r.mutant.id) ? pill('idle', `≡ ${t.equivalent}`) : pill('bad', `✗ ${t.survived}`);
  }

  function renderRows() {
    tbody.replaceChildren();
    if (!S.results.length) { tbody.append(h('tr', {}, h('td', { colspan: 4, class: 'muted' }, t.notStarted))); return; }
    const eqInfo = EXAMPLES[S.ex].equivalent ?? {};
    for (const r of S.results) {
      const cell = h('td', {}, h('code', {}, r.mutant.desc));
      if (r.status === 'killed' || r.status === 'timeout') cell.append(h('div', { class: 'sim-hint' }, `${t.by} „${r.by}“: ${r.msg}`));
      if (r.status === 'survived') {
        const info = eqInfo[eqKey(r)];
        cell.append(h('div', { class: 'sim-hint' }, S.eq.has(r.mutant.id) ? (info?.[lang] ?? '') : info ? t.isEq : `→ ${HINTS[r.mutant.kind][lang]}`));
        cell.append(h('button', { class: 'btn ghost sm', type: 'button', style: 'margin-top:4px', onclick: (e: Event) => { e.stopPropagation(); S.eq.has(r.mutant.id) ? S.eq.delete(r.mutant.id) : S.eq.add(r.mutant.id); renderRows(); renderMetrics(true); } }, S.eq.has(r.mutant.id) ? t.unmarkEq : t.markEq));
      }
      const tr = h('tr', { 'data-click': '1', class: r.mutant.id === S.sel ? 'cur' : '', onclick: () => { S.sel = r.mutant.id; renderRows(); renderCode(); renderDetail(); } },
        h('td', {}, String(r.mutant.id)), h('td', {}, String(r.mutant.line + 1)), cell, h('td', {}, status(r)));
      tbody.append(tr);
    }
  }

  function renderDetail() {
    const r = S.results.find((x) => x.mutant.id === S.sel);
    if (!r) { detail.replaceChildren(); return; }
    detail.replaceChildren(h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, `#${r.mutant.id}: ${r.mutant.desc}`),
      h('ul', { tabindex: 0, class: 'sim-log' }, ...r.results.map((x) => h('li', { class: x.ok ? 'ok' : 'bad' }, `${x.ok ? '✓' : '✗'} ${x.name}${x.msg ? ` — ${x.msg}` : ''}`)))));
  }

  function renderMetrics(final = false) {
    covVal.textContent = S.cov ? `${Math.round(S.cov.pct)} %` : '–';
    covBar.style.width = `${S.cov?.pct ?? 0}%`;
    const sc = mutationScore(S.results, S.eq);
    scoreVal.textContent = sc === null ? '–' : `${Math.round(sc)} %`;
    scoreBar.style.width = `${sc ?? 0}%`;
    if (final) {
      const surv = S.results.filter((r) => r.status === 'survived' && !S.eq.has(r.mutant.id)).length;
      summary.hidden = false;
      summary.className = `sim-callout ${surv ? 'bad' : 'ok'}`;
      summary.textContent = surv ? t.summaryBad(surv) : t.summaryGood;
    }
  }

  function reset() {
    S.run++; S.results = []; S.eq.clear(); S.cov = null; S.sel = -1;
    summary.hidden = true; runBtn.disabled = false; runBtn.textContent = t.run;
    renderCode(); renderTests(); renderRows(); renderMetrics(); renderDetail();
  }

  function load(i: number) {
    S.ex = i; S.code = EXAMPLES[i].code; S.tests = EXAMPLES[i].tests; S.editing = '';
    codeEditBtn.textContent = t.editCode; testEditBtn.textContent = t.editTests;
    [...exBar.children].forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    explain.innerHTML = EXAMPLES[i].explain[lang];
    betterBtn.hidden = !EXAMPLES[i].better;
    reset();
  }

  async function toggleEdit(which: 'code' | 'tests') {
    const box = which === 'code' ? codeBox : testBox;
    const btn = which === 'code' ? codeEditBtn : testEditBtn;
    if (S.editing === which) { S.editing = ''; btn.textContent = which === 'code' ? t.editCode : t.editTests; reset(); return; }
    S.editing = which; btn.textContent = t.done; box.replaceChildren();
    await codeEditor(box, which === 'code' ? S.code : S.tests, (s) => { if (which === 'code') S.code = s; else S.tests = s; }, which === 'code' ? t.code : t.tests);
  }

  async function runAll() {
    S.editing = ''; codeEditBtn.textContent = t.editCode; testEditBtn.textContent = t.editTests;
    reset();
    const id = S.run;
    runBtn.disabled = true; runBtn.textContent = t.running;
    try {
      const c = runWithCoverage(S.code, S.tests, lang, EXTRA);
      S.cov = c;
      if (!c.results.length) throw new Error(t.noTests);
      const bad = c.results.find((r) => !r.ok);
      if (bad) throw new Error(`${t.mustPass} „${bad.name}“ (${bad.msg})`);
      renderCode(); renderMetrics();
      const mutants = generateMutants(S.code);
      const delay = reducedMotion() ? 0 : Math.max(60, 900 / mutants.length);
      for (const m of mutants) {
        if (id !== S.run) return;
        S.results.push(runMutant(m, S.tests, lang, EXTRA));
        S.sel = m.id;
        renderRows(); renderCode(); renderMetrics();
        if (delay) await sleep(delay);
      }
      S.sel = -1; renderRows(); renderCode(); renderMetrics(true);
    } catch (e) {
      summary.hidden = false; summary.className = 'sim-callout bad'; summary.textContent = (e as Error).message;
    } finally {
      if (id === S.run) { runBtn.disabled = false; runBtn.textContent = t.run; }
    }
  }

  runBtn.addEventListener('click', runAll);
  betterBtn.addEventListener('click', () => { const b = EXAMPLES[S.ex].better; if (b) { S.tests = b; S.editing = ''; reset(); } });
  resetBtn.addEventListener('click', () => { S.tests = EXAMPLES[S.ex].tests; S.editing = ''; reset(); });
  codeEditBtn.addEventListener('click', () => toggleEdit('code'));
  testEditBtn.addEventListener('click', () => toggleEdit('tests'));
  load(0);
}
