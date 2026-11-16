import { h, codeView, codeEditor, pill, type Lang } from './kit';
import { OLD_CODE, FIXED_CODE, CHANGED_LINE, START_TEST, SAMPLE_TEST, checkRegression, type RegressionResult } from '../engine/regression';

const T = {
  en: {
    intro: 'Bug report: Ben reserved Rex although Anna already had, because his pet id was `"rex "` with a trailing space. Write one test that fails on the old code and passes on the fix.',
    diff: 'Old (red) vs. fixed (green)', test: 'Your test', run: 'Run on old and fixed', hint: 'Show a sample test', label: 'regression test',
    failsOld: 'fails on old', passesFix: 'passes on fix', passesOld: 'passes on old', failsFix: 'fails on fix',
    no_repro: 'The test passes on the old code too: it does not reproduce the bug.',
    fix_fails: 'The test fails on the fixed code: the test is wrong or the fix is incomplete.',
    no_test: 'No test found. Write a `test(...)` block.',
    good: 'The test fails on the old code and passes on the fix. It is a regression test: if the bug ever returns, this test turns red.',
  },
  de: {
    intro: 'Fehlerbericht: Ben konnte Rex reservieren, obwohl Anna schon reserviert hatte, weil seine Tier-ID `"rex "` ein Leerzeichen am Ende hatte. Schreibe einen Test, der auf dem alten Code scheitert und auf dem Fix besteht.',
    diff: 'Alt (rot) vs. korrigiert (grün)', test: 'Dein Test', run: 'Auf alt und Fix ausführen', hint: 'Beispieltest zeigen', label: 'Regressionstest',
    failsOld: 'scheitert auf alt', passesFix: 'besteht auf Fix', passesOld: 'besteht auf alt', failsFix: 'scheitert auf Fix',
    no_repro: 'Der Test besteht auch auf dem alten Code: Er reproduziert den Fehler nicht.',
    fix_fails: 'Der Test scheitert auf dem korrigierten Code: Der Test ist falsch oder der Fix unvollständig.',
    no_test: 'Kein Test gefunden. Schreibe einen `test(...)`-Block.',
    good: 'Der Test scheitert auf dem alten Code und besteht auf dem Fix. Das ist ein Regressionstest: Kehrt der Fehler zurück, wird er rot.',
  },
};

const withCode = (s: string) => s.split('`').map((p, i) => (i % 2 ? h('code', {}, p) : p));

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let code = START_TEST;
  let ed: Awaited<ReturnType<typeof codeEditor>> | undefined;
  const editHost = h('div', { class: 'tdd-edit', style: 'border:1px solid var(--rule); border-radius:5px; overflow:hidden' });
  const badges = h('div', { class: 'sim-row', 'aria-live': 'polite' });
  const status = h('div', { class: 'sim-callout', role: 'status', hidden: true });
  const msgs = h('div', { class: 'sim-hint' });

  function run() {
    code = ed ? ed.get() : code;
    const r: RegressionResult = checkRegression(code, lang);
    badges.replaceChildren(
      r.old.failed ? pill('ok', `✓ ${t.failsOld}`) : pill('bad', `✗ ${t.passesOld}`),
      r.fixed.failed ? pill('bad', `✗ ${t.failsFix}`) : pill('ok', `✓ ${t.passesFix}`));
    msgs.textContent = r.verdict === 'fix-fails' ? (r.fixed.msg ?? '') : '';
    status.hidden = false;
    status.className = `sim-callout ${r.verdict === 'good' ? 'ok' : 'bad'}`;
    status.replaceChildren(...withCode(t[r.verdict === 'no-repro' ? 'no_repro' : r.verdict === 'fix-fails' ? 'fix_fails' : r.verdict === 'no-test' ? 'no_test' : 'good']));
  }

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, ...withCode(t.intro)),
    h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.diff), codeView(OLD_CODE, [], { line: CHANGED_LINE, code: FIXED_CODE })),
    h('div', { class: 'sim-card' },
      h('div', { class: 'sim-card-title' }, t.test),
      editHost,
      h('div', { class: 'sim-row', style: 'margin-top:8px' },
        h('button', { class: 'btn', type: 'button', onclick: run }, t.run),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => { ed?.set(SAMPLE_TEST); code = SAMPLE_TEST; run(); } }, t.hint)),
      h('div', { style: 'margin-top:8px' }, badges), msgs),
    status));
  codeEditor(editHost, START_TEST, (s) => { code = s; }, t.label).then((e) => { ed = e; });
}
