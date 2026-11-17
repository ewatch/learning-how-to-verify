import { h, codeView, segmented, roleTag, resultPanel, type Lang, type ResultView, type TagKind } from './kit';
import { TYPE_REVISIONS, TYPECHECK_COPY as T, type TypeRevision } from '../../data/typecheck';
import type { TypecheckResult } from '../engine/typecheck';
import { typecheckOutcome, typecheckReport, EXPECTED, type TypecheckOutcome } from '../engine/typecheck-outcome';

/** What each revision IS (tag before the run). */
const REV_TAG: Record<TypeRevision, TagKind> = { unchecked: 'bug', guard: 'correct', assertion: 'bug', overwrite: 'bug' };
const label = (id: TypeRevision, lang: Lang) => TYPE_REVISIONS.find((r) => r.id === id)!.label[lang];

type TV = TypecheckOutcome['values'];
const R = {
  en: {
    verdict: {
      gate: (v: TV) => `The compiler gate fails: ${v.errors} error${v.errors === 1 ? '' : 's'}. Behaviour checks did not run`,
      behaviour: (v: TV) => `The compiler gate passes, but ${v.checks - v.passed} of ${v.checks} behaviour checks fail`,
      pass: (v: TV) => `The compiler gate passes, and ${v.passed} of ${v.checks} behaviour checks pass`,
    },
    why: {
      'possibly-undefined': (v: TV) => [`\`pets[id]\` can return \`undefined\`, because \`noUncheckedIndexedAccess\` is on. Line ${v.diagnostic!.line} uses \`pet\` without a check: error TS${v.diagnostic!.code}.`, 'The compiler rejects the change before any test runs.'],
      'compile-error': (v: TV) => [`Line ${v.diagnostic!.line}: ${v.diagnostic!.message}`],
      'assertion-crash': (v: TV) => [`The \`!\` tells the compiler that \`pet\` is never undefined. It adds no check at runtime. For a missing pet the code reads \`pet.reservedBy\` and throws \`${v.check!.got}\`.`, 'The compiler is silent because the check is switched off for this line, not because the code is safe.'],
      'unchecked-crash': (v: TV) => [`With strict checks off, the compiler does not check that \`pets[id]\` can be undefined. For a missing pet the code throws \`${v.check!.got}\`.`],
      'runtime-error': (v: TV) => [`The check “${T.checks[v.check!.id].en}” throws \`${v.check!.got}\`.`],
      'logic-bug': (v: TV) => [v.check!.id === 'taken'
        ? `All types are valid, but the code does not look at \`reservedBy\`. The check “${T.checks.taken.en}” gets \`${v.check!.got}\`: Ben overwrites Anna's reservation.`
        : `All types are valid, but the check “${T.checks[v.check!.id].en}” gets \`${v.check!.got}\`, not \`${EXPECTED[v.check!.id]}\`.`, 'Types describe the shape of values, not the business rule.'],
      pass: (v: TV) => [v.revision === 'guard' ? 'The guard `if (!pet) return "missing"` narrows `Pet | undefined` to `Pet`. The compiler accepts it, and the three checks pass.' : 'The compiler accepts the code, and the three checks pass.', 'The checks cover three examples. They do not cover concurrent requests or untrusted input.'],
    },
    use: {
      gate: 'The agent gets file, line, column and the error code. It can add a guard for the missing pet without changing the compiler settings.',
      'assertion-crash': 'The agent gets a clean compile and a runtime TypeError. It must remove the `!` and handle the missing pet. A lint rule against `!` stops this shortcut earlier.',
      'unchecked-crash': 'The agent gets a runtime TypeError that the compiler could have found. With strict checks on, the agent gets the error before any test runs.',
      'runtime-error': 'The agent gets the failing check and the exception. It can reproduce it with the same input.',
      'logic-bug': 'The agent gets the broken business rule and the actual values. The compiler cannot give this feedback. Only a behaviour test can.',
      pass: 'The agent gets a clean compile and three passing checks. It can continue. Other risks need other checks.',
    },
    next: {
      gate: () => `Select **${label('guard', 'en')}** (tag: correct) and check again.`,
      'assertion-crash': () => `Select **${label('overwrite', 'en')}** and predict the result.`,
      'unchecked-crash': () => 'Tick **Enable strict checks** and check again.',
      'runtime-error': () => `Select **${label('guard', 'en')}** and compare.`,
      'logic-bug': () => `Select **${label('guard', 'en')}** and compare.`,
      pass: (v: TV) => v.strict ? `Select **${label('assertion', 'en')}** and predict the result.` : `Tick **Enable strict checks** and select **${label('unchecked', 'en')}**.`,
    },
  },
  de: {
    verdict: {
      gate: (v: TV) => `Das Compiler-Gate scheitert: ${v.errors} Fehler. Verhaltenstests liefen nicht`,
      behaviour: (v: TV) => `Das Compiler-Gate besteht, aber ${v.checks - v.passed} von ${v.checks} Verhaltenstests scheitern`,
      pass: (v: TV) => `Das Compiler-Gate besteht, und ${v.passed} von ${v.checks} Verhaltenstests bestehen`,
    },
    why: {
      'possibly-undefined': (v: TV) => [`\`pets[id]\` kann \`undefined\` liefern, weil \`noUncheckedIndexedAccess\` an ist. Zeile ${v.diagnostic!.line} nutzt \`pet\` ohne Prüfung: error TS${v.diagnostic!.code}.`, 'Der Compiler lehnt die Änderung ab, bevor ein Test läuft.'],
      'compile-error': (v: TV) => [`Zeile ${v.diagnostic!.line}: ${v.diagnostic!.message}`],
      'assertion-crash': (v: TV) => [`Das \`!\` sagt dem Compiler, dass \`pet\` nie undefined ist. Zur Laufzeit prüft es nichts. Bei einem fehlenden Tier liest der Code \`pet.reservedBy\` und wirft \`${v.check!.got}\`.`, 'Der Compiler schweigt, weil die Prüfung für diese Zeile abgeschaltet ist, nicht weil der Code sicher ist.'],
      'unchecked-crash': (v: TV) => [`Ohne strenge Prüfungen prüft der Compiler nicht, dass \`pets[id]\` undefined sein kann. Bei einem fehlenden Tier wirft der Code \`${v.check!.got}\`.`],
      'runtime-error': (v: TV) => [`Der Test „${T.checks[v.check!.id].de}“ wirft \`${v.check!.got}\`.`],
      'logic-bug': (v: TV) => [v.check!.id === 'taken'
        ? `Alle Typen sind gültig, aber der Code prüft \`reservedBy\` nicht. Der Test „${T.checks.taken.de}“ bekommt \`${v.check!.got}\`: Ben überschreibt Annas Reservierung.`
        : `Alle Typen sind gültig, aber der Test „${T.checks[v.check!.id].de}“ bekommt \`${v.check!.got}\`, nicht \`${EXPECTED[v.check!.id]}\`.`, 'Typen beschreiben die Form von Werten, nicht die Fachregel.'],
      pass: (v: TV) => [v.revision === 'guard' ? 'Der Guard `if (!pet) return "missing"` schränkt `Pet | undefined` auf `Pet` ein. Der Compiler akzeptiert ihn, und die drei Tests bestehen.' : 'Der Compiler akzeptiert den Code, und die drei Tests bestehen.', 'Die Tests decken drei Beispiele ab. Gleichzeitige Requests und ungeprüfte Eingaben decken sie nicht ab.'],
    },
    use: {
      gate: 'Der Agent bekommt Datei, Zeile, Spalte und Fehlercode. Er kann einen Guard für das fehlende Tier ergänzen, ohne die Compiler-Einstellungen zu ändern.',
      'assertion-crash': 'Der Agent bekommt einen sauberen Compile und einen TypeError zur Laufzeit. Er muss das `!` entfernen und das fehlende Tier behandeln. Eine Lint-Regel gegen `!` stoppt diese Abkürzung früher.',
      'unchecked-crash': 'Der Agent bekommt einen TypeError zur Laufzeit, den der Compiler hätte finden können. Mit strengen Prüfungen bekommt der Agent den Fehler, bevor ein Test läuft.',
      'runtime-error': 'Der Agent bekommt den scheiternden Test und die Exception. Er kann sie mit derselben Eingabe reproduzieren.',
      'logic-bug': 'Der Agent bekommt die verletzte Fachregel und die tatsächlichen Werte. Der Compiler kann dieses Feedback nicht geben. Nur ein Verhaltenstest kann es.',
      pass: 'Der Agent bekommt einen sauberen Compile und drei bestandene Tests. Er kann weitermachen. Andere Risiken brauchen andere Prüfungen.',
    },
    next: {
      gate: () => `**${label('guard', 'de')}** (Tag: korrekt) wählen und erneut prüfen.`,
      'assertion-crash': () => `**${label('overwrite', 'de')}** wählen und das Ergebnis vorhersagen.`,
      'unchecked-crash': () => '**Strenge Prüfungen aktivieren** ankreuzen und erneut prüfen.',
      'runtime-error': () => `**${label('guard', 'de')}** wählen und vergleichen.`,
      'logic-bug': () => `**${label('guard', 'de')}** wählen und vergleichen.`,
      pass: (v: TV) => v.strict ? `**${label('assertion', 'de')}** wählen und das Ergebnis vorhersagen.` : `**Strenge Prüfungen aktivieren** ankreuzen und **${label('unchecked', 'de')}** wählen.`,
    },
  },
};

export function typecheckView(o: TypecheckOutcome, report: string, lang: Lang): ResultView {
  const r = R[lang], v = o.values, c = o.causeId;
  const gate = c === 'possibly-undefined' || c === 'compile-error';
  return {
    status: o.status,
    verdict: gate ? r.verdict.gate(v) : c === 'pass' ? r.verdict.pass(v) : r.verdict.behaviour(v),
    why: r.why[c](v),
    agent: { tool: gate ? 'tsc' : 'tsc + Vitest', output: report, use: gate ? r.use.gate : r.use[c as Exclude<typeof c, 'possibly-undefined' | 'compile-error'>] },
    next: gate ? r.next.gate() : r.next[c as Exclude<typeof c, 'possibly-undefined' | 'compile-error'>](v),
  };
}

export function mount(root: HTMLElement, lang: Lang) {
  let revision: TypeRevision = 'unchecked';
  let strict = true;
  let worker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const code = h('div');
  const output = h('div', { 'data-typecheck-output': '' });
  const panel = resultPanel(lang);
  const run = h('button', { type: 'button', class: 'btn', onclick: check }, T.run[lang]);
  const current = () => TYPE_REVISIONS.find((r) => r.id === revision)!;

  function stop() {
    worker?.terminate();
    worker = undefined;
    clearTimeout(timer);
    run.disabled = false;
    run.textContent = T.run[lang];
  }
  function reset() {
    stop();
    code.replaceChildren(codeView(current().code));
    output.replaceChildren(h('p', { class: 'muted small' }, T.ready[lang]));
    panel.clear();
  }
  function fail() {
    stop();
    output.replaceChildren(h('p', { class: 'sim-callout bad' }, T.failed[lang]));
  }
  function render(result: TypecheckResult) {
    const blocked = result.diagnostics.length > 0;
    output.replaceChildren(h('p', { class: 'sim-hint' }, blocked ? T.blocked[lang] : T.passed[lang]));
    if (blocked) {
      const diagnostics = result.diagnostics.map((d) => `reserve.ts(${d.line},${d.column}): error TS${d.code}: ${d.message}`).join('\n');
      output.append(h('pre', { tabindex: 0 }, diagnostics));
    } else {
      output.append(h('ul', { class: 'sim-log' }, ...result.checks.map((c) =>
        h('li', { class: c.pass ? 'ok' : 'bad' }, `${c.pass ? 'PASS' : 'FAIL'} ${T.checks[c.id][lang]}\n  ${c.got}`))));
    }
    panel.show(typecheckView(typecheckOutcome(revision, strict, result, current().code), typecheckReport(result), lang));
  }
  function check() {
    stop();
    run.disabled = true;
    run.textContent = T.running[lang];
    output.replaceChildren(h('p', { class: 'muted small', role: 'status' }, T.running[lang]));
    panel.clear();
    try {
      worker = new Worker(new URL('../engine/typecheck.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<{ result?: TypecheckResult; error?: boolean }>) => {
        if (!event.data.result) { fail(); return; }
        stop();
        render(event.data.result);
      };
      worker.onerror = fail;
      timer = setTimeout(fail, 20000);
      worker.postMessage({ revision, strict });
    } catch { fail(); }
  }
  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, T.intro[lang]),
    segmented(T.revision[lang], TYPE_REVISIONS.map((r) => ({ value: r.id, label: r.label[lang], tag: roleTag(REV_TAG[r.id], lang) })), revision, (value) => { revision = value; reset(); }),
    code,
    h('div', { class: 'sim-row' }, run,
      h('label', { class: 'inline' }, h('input', { type: 'checkbox', checked: true, onchange: (event: Event) => { strict = (event.target as HTMLInputElement).checked; reset(); } }), T.strict[lang])),
    output,
    panel.el,
    h('p', { class: 'sim-hint' }, T.scope[lang]),
  ));
  window.addEventListener('pagehide', stop, { once: true });
  reset();
}
