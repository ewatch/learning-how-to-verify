import { h, codeView, codeEditor, pill, sleep, reducedMotion, roleTag, resultPanel, type Lang, type ResultView, type TagKind } from './kit';
import { runWithCoverage } from '../engine/jsrun';
import { vitestReport, vitestMessage } from '../engine/outcome';
import { generateMutants, runMutant, mutationScore, mutationOutcome, strykerReport, type MutantKind, type MutantResult, type MutationOutcome, type MutationRun } from '../engine/mutate';

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

/** What the tests of each example ARE (shown as a tag before the run). */
const EX_TAG: TagKind[] = ['weak', 'weak', 'strong'];
const FILE = ['src/fee.js', 'src/reserve.js', 'src/oldest.js'];

type MV = MutationOutcome['values'];
const R = {
  en: {
    verdict: {
      'no-tests': () => 'No tests: mutation testing cannot start',
      'tests-fail': () => 'A test fails on the original code: mutation testing cannot start',
      survivors: (v: MV) => `${v.survived} of ${v.counted} mutants survived. Mutation score ${Math.round(v.score ?? 0)} %`,
      'equivalent-left': (v: MV) => `${v.survived} of ${v.counted} mutants survived, but no test can kill them`,
      'all-killed': (v: MV) => `Every non-equivalent mutant was killed. ${v.killed + v.timeouts} of ${v.counted}, score 100 %`,
    },
    why: {
      'no-tests': () => ['The test suite contains no tests. Every mutant would survive.'],
      'tests-fail': (v: MV) => [`The test “${v.failing!.name}” fails on the unchanged code: ${v.failing!.msg}.`, 'A mutant counts as killed when a test fails. A red suite would kill every mutant and prove nothing.'],
      survivors: (v: MV, lang: Lang) => [`Mutant #${v.first!.id} changes \`${v.first!.desc}\` on line ${v.first!.line}, and ${v.tests === 1 ? 'the only test still passes' : `all ${v.tests} tests still pass`}. ${HINTS[v.first!.kind][lang]}`, `Line coverage is ${Math.round(v.coverage)} %, so coverage alone does not show this gap.`],
      'equivalent-left': (v: MV) => [`Mutant #${v.first!.id} (\`${v.first!.desc}\`, line ${v.first!.line}) behaves exactly like the original. No input can tell them apart, so no test can kill it.`, 'Such mutants are equivalent. A person has to recognise and mark them.'],
      'all-killed': (v: MV) => ['Each mutant changes the behaviour, and at least one test notices every change.' + (v.equivalent ? ` ${v.equivalent} equivalent mutant${v.equivalent === 1 ? ' is' : 's are'} marked and do${v.equivalent === 1 ? 'es' : ''} not count.` : ''), 'This shows that the tests check this code closely. It does not show that the code meets the requirement.'],
    },
    use: {
      'no-tests': 'The agent gets an error and must write tests first.',
      'tests-fail': 'The agent gets the failing test first. It must fix the code or the test before the mutation score means anything.',
      survivors: 'The agent gets the exact line, the change and the tests that ran. It can add an assertion that fails on this change, then run again.',
      'equivalent-left': 'The agent gets survivors that no test can kill. It must not write fake tests for them. It reports them as equivalent, so a person can confirm.',
      'all-killed': 'The agent gets a score with no survivors. It can stop adding tests for this code.',
    },
    next: {
      reset: 'Click **Reset tests** and run again.',
      better: 'Click **Load better tests** (tag: strong tests) and run again.',
      kill: (v: MV) => `Click mutant #${v.first!.id} in the table. Then click **Edit tests** and add a test that fails on this change.`,
      mark: 'Click **mark as equivalent** on each survivor.',
      nextEx: (name: string) => `Select the next example: **${name}**.`,
      edit: 'Click **Edit tests**, delete one assertion and run again.',
    },
  },
  de: {
    verdict: {
      'no-tests': () => 'Keine Tests: Mutation Testing kann nicht starten',
      'tests-fail': () => 'Ein Test scheitert am Originalcode: Mutation Testing kann nicht starten',
      survivors: (v: MV) => `${v.survived} von ${v.counted} Mutanten überlebt. Mutation Score ${Math.round(v.score ?? 0)} %`,
      'equivalent-left': (v: MV) => `${v.survived} von ${v.counted} Mutanten überlebt, aber kein Test kann sie töten`,
      'all-killed': (v: MV) => `Jeder nicht äquivalente Mutant wurde getötet. ${v.killed + v.timeouts} von ${v.counted}, Score 100 %`,
    },
    why: {
      'no-tests': () => ['Die Testsuite enthält keine Tests. Jeder Mutant würde überleben.'],
      'tests-fail': (v: MV) => [`Der Test „${v.failing!.name}“ scheitert am unveränderten Code: ${v.failing!.msg}.`, 'Ein Mutant gilt als getötet, wenn ein Test scheitert. Eine rote Suite würde jeden Mutanten töten und nichts beweisen.'],
      survivors: (v: MV, lang: Lang) => [`Mutant #${v.first!.id} ändert \`${v.first!.desc}\` in Zeile ${v.first!.line}, und ${v.tests === 1 ? 'der einzige Test besteht weiter' : `alle ${v.tests} Tests bestehen weiter`}. ${HINTS[v.first!.kind][lang]}`, `Die Zeilenabdeckung ist ${Math.round(v.coverage)} %. Die Abdeckung allein zeigt diese Lücke nicht.`],
      'equivalent-left': (v: MV) => [`Mutant #${v.first!.id} (\`${v.first!.desc}\`, Zeile ${v.first!.line}) verhält sich exakt wie das Original. Keine Eingabe unterscheidet sie, darum kann kein Test ihn töten.`, 'Solche Mutanten sind äquivalent. Ein Mensch muss sie erkennen und markieren.'],
      'all-killed': (v: MV) => ['Jeder Mutant ändert das Verhalten, und mindestens ein Test bemerkt jede Änderung.' + (v.equivalent ? ` ${v.equivalent} äquivalente${v.equivalent === 1 ? 'r Mutant ist' : ' Mutanten sind'} markiert und ${v.equivalent === 1 ? 'zählt' : 'zählen'} nicht.` : ''), 'Das zeigt: Die Tests prüfen diesen Code genau. Es zeigt nicht, dass der Code die Anforderung erfüllt.'],
    },
    use: {
      'no-tests': 'Der Agent bekommt einen Fehler und muss zuerst Tests schreiben.',
      'tests-fail': 'Der Agent bekommt zuerst den scheiternden Test. Er muss Code oder Test korrigieren, bevor der Mutation Score etwas bedeutet.',
      survivors: 'Der Agent bekommt die genaue Zeile, die Änderung und die gelaufenen Tests. Er kann eine Assertion ergänzen, die an dieser Änderung scheitert, und erneut starten.',
      'equivalent-left': 'Der Agent bekommt Überlebende, die kein Test töten kann. Er darf keine Schein-Tests dafür schreiben. Er meldet sie als äquivalent, damit ein Mensch sie bestätigt.',
      'all-killed': 'Der Agent bekommt einen Score ohne Überlebende. Er kann für diesen Code aufhören, Tests zu ergänzen.',
    },
    next: {
      reset: 'Auf **Tests zurücksetzen** klicken und erneut starten.',
      better: 'Auf **Bessere Tests laden** (Tag: starke Tests) klicken und erneut starten.',
      kill: (v: MV) => `Mutant #${v.first!.id} in der Tabelle anklicken. Dann **Tests bearbeiten** und einen Test ergänzen, der an dieser Änderung scheitert.`,
      mark: 'Bei jedem Überlebenden auf **als äquivalent markieren** klicken.',
      nextEx: (name: string) => `Das nächste Beispiel wählen: **${name}**.`,
      edit: 'Auf **Tests bearbeiten** klicken, eine Assertion löschen und erneut starten.',
    },
  },
};

const T = {
  en: { run: 'Run mutation testing', running: 'Running…', better: 'Load better tests', reset: 'Reset tests', editCode: 'Edit code', editTests: 'Edit tests', done: 'Done editing', code: 'Code under test', tests: 'Tests', coverage: 'Line coverage', score: 'Mutation score', mutants: 'Mutants', killed: 'killed', survived: 'survived', timeout: 'timeout (killed)', invalid: 'does not compile', equivalent: 'equivalent', markEq: 'mark as equivalent', unmarkEq: 'equivalent (undo)', by: 'killed by', isEq: 'Is there any input for which this mutant behaves differently from the original? If not, it is equivalent.', notStarted: 'Not started yet.', click: 'Click a row to see the change.', col: ['#', 'Line', 'Change', 'Status'] },
  de: { run: 'Mutation Testing starten', running: 'Läuft …', better: 'Bessere Tests laden', reset: 'Tests zurücksetzen', editCode: 'Code bearbeiten', editTests: 'Tests bearbeiten', done: 'Fertig', code: 'Getesteter Code', tests: 'Tests', coverage: 'Zeilenabdeckung', score: 'Mutation Score', mutants: 'Mutanten', killed: 'getötet', survived: 'überlebt', timeout: 'Timeout (getötet)', invalid: 'kompiliert nicht', equivalent: 'äquivalent', markEq: 'als äquivalent markieren', unmarkEq: 'äquivalent (zurücknehmen)', by: 'getötet durch', isEq: 'Gibt es überhaupt eine Eingabe, bei der sich dieser Mutant anders verhält als das Original? Wenn nicht, ist er äquivalent.', notStarted: 'Noch nicht gestartet.', click: 'Zeile anklicken, um die Änderung zu sehen.', col: ['#', 'Zeile', 'Änderung', 'Status'] },
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
  const panel = resultPanel(lang);
  const testTag = h('span');
  const lastRun: { tests: number; error?: MutationRun['error']; report?: string } = { tests: 0 };
  let suite: TagKind | '' = 'weak';
  const tbody = h('tbody');
  const detail = h('div');

  const metric = (label: string, val: HTMLElement, bar: HTMLElement, c: string) =>
    h('div', { class: 'sim-metric' }, h('span', {}, label), val, h('div', { class: 'sim-meter', style: `--c:${c}` }, bar));

  root.append(h('div', { class: 'sim' },
    exBar, explain,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.code, codeEditBtn), codeBox),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, h('span', {}, t.tests, ' ', testTag), testEditBtn), testBox),
    ),
    h('div', { class: 'sim-row' }, runBtn, betterBtn, resetBtn),
    h('div', { class: 'sim-row' }, metric(t.coverage, covVal, covBar, 'var(--l-static)'), metric(t.score, scoreVal, scoreBar, 'var(--ok)')),
    panel.el,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.mutants, h('span', { class: 'small muted', style: 'text-transform:none;letter-spacing:0;font-weight:400' }, t.click)),
        h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, ...t.col.map((c) => h('th', {}, c)))), tbody)),
      detail,
    ),
  ));

  EXAMPLES.forEach((ex, i) => exBar.append(h('button', { class: 'btn ghost sm', type: 'button', 'aria-pressed': String(i === 0), onclick: () => load(i) }, ex.name[lang], ' ', roleTag(EX_TAG[i], lang))));
  betterBtn.append(' ', roleTag('strong', lang));
  function setSuite(k: TagKind | '') { suite = k; testTag.replaceChildren(...(k ? [roleTag(k, lang)] : [])); }

  function showPanel() {
    const known = new Set(S.results.filter((r) => EXAMPLES[S.ex].equivalent?.[eqKey(r)]).map((r) => r.mutant.id));
    const run: MutationRun = { results: S.results, marked: S.eq, knownEquivalent: known, coverage: S.cov?.pct ?? 0, tests: lastRun.tests, error: lastRun.error };
    const o = mutationOutcome(run);
    const r = R[lang];
    const v = o.values;
    const c = o.causeId;
    const output = c === 'no-tests' ? 'Error: No tests found. Mutation testing needs a passing test suite.'
      : c === 'tests-fail' ? vitestReport('code.test.js', [{ name: v.failing!.name, ok: false, msg: lastRun.report }])
      : strykerReport(S.code, run, FILE[S.ex]);
    const hasBetter = !!EXAMPLES[S.ex].better && suite !== 'strong';
    const next = c === 'no-tests' || c === 'tests-fail' ? r.next.reset
      : c === 'survivors' ? (hasBetter ? r.next.better : r.next.kill(v))
      : c === 'equivalent-left' ? r.next.mark
      : S.ex < EXAMPLES.length - 1 ? r.next.nextEx(EXAMPLES[S.ex + 1].name[lang]) : r.next.edit;
    const view: ResultView = { status: o.status, verdict: r.verdict[c](v), why: r.why[c](v, lang), agent: { tool: c === 'tests-fail' ? 'Vitest' : 'Stryker', output, use: r.use[c] }, next };
    panel.show(view);
  }

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
    if (final) showPanel();
  }

  function reset() {
    S.run++; S.results = []; S.eq.clear(); S.cov = null; S.sel = -1;
    panel.clear(); lastRun.error = undefined; lastRun.report = undefined; runBtn.disabled = false; runBtn.textContent = t.run;
    renderCode(); renderTests(); renderRows(); renderMetrics(); renderDetail();
  }

  function load(i: number) {
    S.ex = i; S.code = EXAMPLES[i].code; S.tests = EXAMPLES[i].tests; S.editing = '';
    codeEditBtn.textContent = t.editCode; testEditBtn.textContent = t.editTests;
    [...exBar.children].forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    explain.innerHTML = EXAMPLES[i].explain[lang];
    betterBtn.hidden = !EXAMPLES[i].better;
    setSuite(EX_TAG[i]);
    reset();
  }

  async function toggleEdit(which: 'code' | 'tests') {
    const box = which === 'code' ? codeBox : testBox;
    const btn = which === 'code' ? codeEditBtn : testEditBtn;
    if (S.editing === which) { S.editing = ''; btn.textContent = which === 'code' ? t.editCode : t.editTests; reset(); return; }
    S.editing = which; btn.textContent = t.done; box.replaceChildren();
    if (which === 'tests') setSuite('');
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
      lastRun.tests = c.results.length;
      if (!c.results.length) { lastRun.error = { kind: 'no-tests' }; showPanel(); return; }
      const bad = c.results.find((r) => !r.ok);
      if (bad) {
        lastRun.error = { kind: 'tests-fail', name: bad.name, msg: bad.msg ?? '' };
        const en = runWithCoverage(S.code, S.tests, 'en', EXTRA).results.find((r) => r.name === bad.name);
        lastRun.report = vitestMessage(en?.msg);
        renderCode(); renderMetrics(); showPanel(); return;
      }
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
      lastRun.error = { kind: 'tests-fail', name: '—', msg: (e as Error).message };
      lastRun.report = `${(e as Error).name}: ${(e as Error).message}`;
      showPanel();
    } finally {
      if (id === S.run) { runBtn.disabled = false; runBtn.textContent = t.run; }
    }
  }

  runBtn.addEventListener('click', runAll);
  betterBtn.addEventListener('click', () => { const b = EXAMPLES[S.ex].better; if (b) { S.tests = b; S.editing = ''; setSuite('strong'); reset(); } });
  resetBtn.addEventListener('click', () => { S.tests = EXAMPLES[S.ex].tests; S.editing = ''; setSuite(EX_TAG[S.ex]); reset(); });
  codeEditBtn.addEventListener('click', () => toggleEdit('code'));
  testEditBtn.addEventListener('click', () => toggleEdit('tests'));
  load(0);
}
