import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, codeView, codeEditor, pill, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { OLD_CODE, FIXED_CODE, CHANGED_LINE, START_TEST, SAMPLE_TEST, checkRegression, regressionOutcome, regressionReport, type RegressionResult, type RegressionOutcome } from '../engine/regression';

type RV = RegressionOutcome['values'];
const R = {
  en: {
    verdict: {
      'no-test': () => 'No test found',
      norepro: () => 'The test passes on the old code: it does not reproduce the bug',
      'fix-fails': () => 'The test fails on the fixed code',
      good: () => 'The regression test works: it fails on the old code and passes on the fix',
    },
    why: {
      'no-test': () => ['Write a `test(...)` block. Without a test, nothing runs.'],
      'no-assertion': () => ['The test has no `expect`. A test without an assertion passes on any code.'],
      'no-trailing-space': () => ['The bug needs a pet id with a trailing space, such as `"rex "`. Your test never uses one, so the old code behaves correctly for it.'],
      'no-repro': () => ['The old code and the fix give the same result for your test. Check that the second reservation uses `"rex "` and that the test expects `taken`.'],
      'fix-fails': (v: RV) => [`On the fixed code the test fails: \`${v.fixedMsg ?? ''}\`.`, 'The expectation is wrong, or the fix is incomplete.'],
      good: (v: RV) => [`On the old code it fails: \`${v.oldMsg ?? ''}\`. On the fix it passes.`, 'If someone removes the `.trim()` later, this test turns red.'],
    },
    use: {
      'no-test': 'The agent gets no test and no signal.',
      norepro: 'The agent gets a green run on the buggy code. The test gives no signal, so the bug can come back unnoticed.',
      'fix-fails': 'The agent gets a red run on the fixed code. It may undo the correct fix. Check the test first.',
      good: 'If an agent later breaks the fix, it gets this failure with the input from the bug report. It can restore the fix before the merge.',
    },
    next: {
      repro: 'Reserve `"rex"` for Anna, then `"rex "` for Ben, and expect `{ ok: false, reason: "taken" }`. Or click **Show a sample test** (tag: correct).',
      'fix-fails': 'Compare your expectation with the fixed code above.',
      good: 'Delete the `expect` line and run again. The test then passes on the old code too.',
    },
  },
  de: {
    verdict: {
      'no-test': () => 'Kein Test gefunden',
      norepro: () => 'Der Test besteht auf dem alten Code: Er reproduziert den Fehler nicht',
      'fix-fails': () => 'Der Test scheitert auf dem korrigierten Code',
      good: () => 'Der Regressionstest funktioniert: Er scheitert auf dem alten Code und besteht auf dem Fix',
    },
    why: {
      'no-test': () => ['Schreibe einen `test(...)`-Block. Ohne Test läuft nichts.'],
      'no-assertion': () => ['Der Test hat kein `expect`. Ein Test ohne Assertion besteht auf jedem Code.'],
      'no-trailing-space': () => ['Der Fehler braucht eine Tier-ID mit Leerzeichen am Ende, etwa `"rex "`. Dein Test nutzt keine, darum verhält sich der alte Code für ihn korrekt.'],
      'no-repro': () => ['Alter Code und Fix liefern für deinen Test dasselbe Ergebnis. Prüfe, dass die zweite Reservierung `"rex "` nutzt und der Test `taken` erwartet.'],
      'fix-fails': (v: RV) => [`Auf dem korrigierten Code scheitert der Test: \`${v.fixedMsg ?? ''}\`.`, 'Die Erwartung ist falsch, oder der Fix ist unvollständig.'],
      good: (v: RV) => [`Auf dem alten Code scheitert er: \`${v.oldMsg ?? ''}\`. Auf dem Fix besteht er.`, 'Entfernt später jemand das `.trim()`, wird dieser Test rot.'],
    },
    use: {
      'no-test': 'Der Agent bekommt keinen Test und kein Signal.',
      norepro: 'Der Agent bekommt einen grünen Lauf auf dem fehlerhaften Code. Der Test gibt kein Signal, darum kann der Fehler unbemerkt zurückkommen.',
      'fix-fails': 'Der Agent bekommt einen roten Lauf auf dem korrigierten Code. Er macht den richtigen Fix vielleicht rückgängig. Zuerst den Test prüfen.',
      good: 'Bricht ein Agent später den Fix, bekommt er diesen Fehlschlag mit der Eingabe aus dem Fehlerbericht. Er kann den Fix vor dem Merge wiederherstellen.',
    },
    next: {
      repro: '`"rex"` für Anna reservieren, dann `"rex "` für Ben, und `{ ok: false, reason: "taken" }` erwarten. Oder **Beispieltest zeigen** (Tag: korrekt) klicken.',
      'fix-fails': 'Deine Erwartung mit dem korrigierten Code oben vergleichen.',
      good: 'Die `expect`-Zeile löschen und erneut ausführen. Dann besteht der Test auch auf dem alten Code.',
    },
  },
};

export function regressionView(o: RegressionOutcome, report: string, lang: Lang): ResultView {
  const r = R[lang], v = o.values, c = o.causeId;
  const norepro = c === 'no-assertion' || c === 'no-trailing-space' || c === 'no-repro';
  const key = norepro ? 'norepro' : c;
  return {
    status: o.status,
    verdict: r.verdict[key as keyof typeof r.verdict](),
    why: r.why[c](v),
    agent: { tool: 'Vitest', output: report, use: r.use[key as keyof typeof r.use] },
    next: c === 'good' ? r.next.good : c === 'fix-fails' ? r.next['fix-fails'] : r.next.repro,
  };
}

const T = {
  en: {
    intro: 'Bug report: Ben reserved Rex although Anna already had, because his pet id was `"rex "` with a trailing space. Write one test that fails on the old code and passes on the fix.',
    diff: 'Old (red) vs. fixed (green)', test: 'Your test', run: 'Run on old and fixed', hint: 'Show a sample test', label: 'regression test',
    failsOld: 'fails on old', passesFix: 'passes on fix', passesOld: 'passes on old', failsFix: 'fails on fix',
  },
  de: {
    intro: EXERCISE_DE.regression.intro,
    diff: 'Alt (rot) vs. korrigiert (grün)', test: 'Dein Test', run: 'Auf alt und Fix ausführen', hint: 'Beispieltest zeigen', label: 'Regressionstest',
    failsOld: 'scheitert auf alt', passesFix: 'besteht auf Fix', passesOld: 'besteht auf alt', failsFix: 'scheitert auf Fix',
  },
};

const withCode = (s: string) => s.split('`').map((p, i) => (i % 2 ? h('code', {}, p) : p));

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let code = START_TEST;
  let ed: Awaited<ReturnType<typeof codeEditor>> | undefined;
  const editHost = h('div', { class: 'tdd-edit', style: 'border:1px solid var(--rule); border-radius:5px; overflow:hidden' });
  const badges = h('div', { class: 'sim-row', 'aria-live': 'polite' });
  const panel = resultPanel(lang);
  const msgs = h('div', { class: 'sim-hint' });

  function run() {
    code = ed ? ed.get() : code;
    const r: RegressionResult = checkRegression(code, lang);
    badges.replaceChildren(
      r.old.failed ? pill('ok', `✓ ${t.failsOld}`) : pill('bad', `✗ ${t.passesOld}`),
      r.fixed.failed ? pill('bad', `✗ ${t.failsFix}`) : pill('ok', `✓ ${t.passesFix}`));
    msgs.textContent = r.verdict === 'fix-fails' ? (r.fixed.msg ?? '') : '';
    panel.show(regressionView(regressionOutcome(code, r), regressionReport(code, checkRegression(code, 'en')), lang));
  }

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, ...withCode(t.intro)),
    h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.diff), codeView(OLD_CODE, [], { line: CHANGED_LINE, code: FIXED_CODE })),
    h('div', { class: 'sim-card' },
      h('div', { class: 'sim-card-title' }, t.test),
      editHost,
      h('div', { class: 'sim-row', style: 'margin-top:8px' },
        h('button', { class: 'btn', type: 'button', onclick: run }, t.run),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => { ed?.set(SAMPLE_TEST); code = SAMPLE_TEST; run(); } }, t.hint, ' ', roleTag('correct', lang))),
      h('div', { style: 'margin-top:8px' }, badges), msgs),
    panel.el));
  codeEditor(editHost, START_TEST, (s) => { code = s; }, t.label).then((e) => { ed = e; });
}
