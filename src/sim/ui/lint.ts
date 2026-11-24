import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, codeEditor, codeRows, pill, segmented, reducedMotion, sleep, esc, roleTag, resultPanel, type Lang, type CodeRow, type ResultView } from './kit';
import { lint, SNIPPET, RULE_IDS, PATCH_BEFORE, PATCH_AFTER, lintOutcome, ciOutcome, eslintReport, type RuleId, type Finding, type LintOutcome } from '../engine/lint';

type LV = LintOutcome['values'];
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const R = {
  en: {
    verdict: {
      findings: (v: LV) => `${plural(v.count, 'finding', 'findings')}: the lint check fails`,
      'rules-off': (v: LV) => `No findings, but ${v.rulesOff.length} of ${v.rulesTotal} rules are off`,
      'code-removed': () => 'No findings, but the function was removed or cut down',
      solved: (v: LV) => `All findings fixed. 0 findings, ${v.rulesOn} of ${v.rulesTotal} rules on`,
    },
    rule: {
      'no-floating-promise': (f: Finding) => `Line ${f.line} calls \`${f.token}(…)\` without \`await\`. If the save fails, nobody sees the error, and the function returns before the pet is saved.`,
      eqeqeq: (f: Finding) => `Line ${f.line} compares with \`${f.token}\`. It converts types before it compares, so \`'1' == 1\` is true.`,
      'no-explicit-any': (f: Finding) => `Line ${f.line} declares \`any\`. The type checker does not check this value at all.`,
      'no-math-random-in-domain': (f: Finding) => `Line ${f.line} uses \`Math.random()\`. A test cannot predict the ticket, and a failure cannot be reproduced.`,
    } as Record<RuleId, (f: Finding) => string>,
    more: (n: number) => `${plural(n, 'more finding is', 'more findings are')} in the list below.`,
    why: {
      'rules-off': (v: LV) => [`The linter checks only the rules that are on. With all rules on, the code has ${plural(v.count, 'finding', 'findings')}.`],
      'code-removed': () => ['The linter finds nothing because the code is gone. `reservePet` must still call `repo.save`.'],
      solved: () => ['Every rule passes on every line.', 'Lint checks patterns, not behaviour. Tests still have to check that a reservation works.'],
    },
    use: {
      findings: 'The agent gets rule, line and column for each finding. It can fix each one and run the linter again until the output is empty.',
      'rules-off': 'The agent gets a clean run, but only for the rules that are on. A rule that is off gives no signal.',
      'code-removed': 'The agent gets a clean run for code that no longer does its job. Lint does not notice this. A test does.',
      solved: 'The agent gets no output and exit code 0. CI lets the change pass this check.',
    },
    next: {
      findings: (v: LV) => `Fix line ${v.first!.line} in the editor.`,
      'rules-off': () => 'Switch all rules on again.',
      'code-removed': () => 'Reload the page to restore the code. Then fix the findings without deleting the function.',
      solved: () => 'Select **Rule as prose vs lint** and click **Open the pull request**.',
    },
    ci: {
      verdict: 'The lint gate blocks the pull request. The rule as prose lets it merge',
      why: (f: Finding) => [`The patch removes \`await\` before \`${f.token}(…)\` on line ${f.line}. AGENTS.md asks for await, but nothing checks the sentence, so that pull request merges.`, `The lint rule finds the floating promise at ${f.line}:${f.col} and fails the CI run.`],
      use: 'The agent gets the rule, the line and a red CI run. It adds await and pushes again. With the rule as prose, it gets nothing.',
      next: 'Write your next agent rule as a lint rule or a test, not only as a sentence.',
    },
  },
  de: {
    verdict: {
      findings: (v: LV) => `${plural(v.count, 'Fund', 'Funde')}: Die Lint-Prüfung scheitert`,
      'rules-off': (v: LV) => `Keine Funde, aber ${v.rulesOff.length} von ${v.rulesTotal} Regeln sind aus`,
      'code-removed': () => 'Keine Funde, aber die Funktion wurde entfernt oder gekürzt',
      solved: (v: LV) => `Alle Funde behoben. 0 Funde, ${v.rulesOn} von ${v.rulesTotal} Regeln an`,
    },
    rule: {
      'no-floating-promise': (f: Finding) => `Zeile ${f.line} ruft \`${f.token}(…)\` ohne \`await\` auf. Scheitert das Speichern, sieht niemand den Fehler, und die Funktion kehrt zurück, bevor das Tier gespeichert ist.`,
      eqeqeq: (f: Finding) => `Zeile ${f.line} vergleicht mit \`${f.token}\`. Das wandelt Typen vor dem Vergleich um, darum ist \`'1' == 1\` wahr.`,
      'no-explicit-any': (f: Finding) => `Zeile ${f.line} deklariert \`any\`. Der Type-Checker prüft diesen Wert gar nicht.`,
      'no-math-random-in-domain': (f: Finding) => `Zeile ${f.line} nutzt \`Math.random()\`. Ein Test kann das Ticket nicht vorhersagen, und ein Fehlschlag lässt sich nicht reproduzieren.`,
    } as Record<RuleId, (f: Finding) => string>,
    more: (n: number) => `${n} ${n === 1 ? 'weiterer Fund steht' : 'weitere Funde stehen'} in der Liste unten.`,
    why: {
      'rules-off': (v: LV) => [`Der Linter prüft nur eingeschaltete Regeln. Mit allen Regeln hat der Code ${plural(v.count, 'Fund', 'Funde')}.`],
      'code-removed': () => ['Der Linter findet nichts, weil der Code fehlt. `reservePet` muss weiter `repo.save` aufrufen.'],
      solved: () => ['Jede Regel besteht auf jeder Zeile.', 'Lint prüft Muster, nicht Verhalten. Tests müssen weiter prüfen, dass eine Reservierung funktioniert.'],
    },
    use: {
      findings: 'Der Agent bekommt Regel, Zeile und Spalte für jeden Fund. Er kann jeden beheben und den Linter erneut starten, bis die Ausgabe leer ist.',
      'rules-off': 'Der Agent bekommt einen sauberen Lauf, aber nur für eingeschaltete Regeln. Eine ausgeschaltete Regel gibt kein Signal.',
      'code-removed': 'Der Agent bekommt einen sauberen Lauf für Code, der seine Aufgabe nicht mehr erfüllt. Lint merkt das nicht. Ein Test merkt es.',
      solved: 'Der Agent bekommt keine Ausgabe und Exit-Code 0. Die CI lässt die Änderung diese Prüfung passieren.',
    },
    next: {
      findings: (v: LV) => `Zeile ${v.first!.line} im Editor beheben.`,
      'rules-off': () => 'Alle Regeln wieder einschalten.',
      'code-removed': () => 'Die Seite neu laden, um den Code wiederherzustellen. Dann die Funde beheben, ohne die Funktion zu löschen.',
      solved: () => '**Regel als Text vs. Lint** wählen und **Pull Request öffnen** klicken.',
    },
    ci: {
      verdict: 'Das Lint-Gate blockiert den Pull Request. Die Regel als Text lässt ihn mergen',
      why: (f: Finding) => [`Der Patch entfernt \`await\` vor \`${f.token}(…)\` in Zeile ${f.line}. AGENTS.md verlangt await, aber nichts prüft den Satz, darum wird dieser Pull Request gemergt.`, `Die Lint-Regel findet das nicht awaitete Promise bei ${f.line}:${f.col} und lässt den CI-Lauf scheitern.`],
      use: 'Der Agent bekommt die Regel, die Zeile und einen roten CI-Lauf. Er ergänzt await und pusht erneut. Mit der Regel als Text bekommt er nichts.',
      next: 'Die nächste Regel für den Agenten als Lint-Regel oder Test schreiben, nicht nur als Satz.',
    },
  },
};

export function lintView(o: LintOutcome, src: string, enabled: Set<RuleId>, lang: Lang): ResultView {
  const r = R[lang], v = o.values, c = o.causeId;
  const why = c === 'findings' ? [r.rule[v.first!.rule](v.first!), ...(v.count > 1 ? [r.more(v.count - 1)] : [])] : r.why[c](v);
  return { status: o.status, verdict: r.verdict[c](v), why, agent: { tool: 'ESLint', output: eslintReport(lint(src, enabled)), use: r.use[c] }, next: r.next[c](v) };
}

export function ciResultView(lang: Lang): ResultView {
  const r = R[lang].ci, o = ciOutcome(), f = o.values.finding;
  const output = `${eslintReport(lint(PATCH_AFTER, ['no-floating-promise']), 'src/reservations.ts')}\nError: Process completed with exit code 1.`;
  return { status: o.status, verdict: r.verdict, why: r.why(f), agent: { tool: 'ESLint in CI', output, use: r.use }, next: r.next };
}
import './lint.css';

const T = {
  en: {
    intro: 'This code has problems a linter can see. Fix every finding in the editor.',
    modes: [{ value: 'fix', label: 'Fix the code' }, { value: 'ci', label: 'Rule as prose vs lint' }],
    mode: 'Mode', rules: 'Rules', editor: 'Petstore domain code', findings: 'Findings',
    msg: {
      'no-math-random-in-domain': 'Math.random() is not testable or reproducible. Inject an id generator.',
      'no-floating-promise': 'This promise is not awaited: errors vanish and the reserve may not be saved.',
      'eqeqeq': 'Use === / !== (no type coercion).',
      'no-explicit-any': 'Avoid any: it switches the type checker off here.',
    } as Record<RuleId, string>,
    none: 'No findings.', hidden: 'Rules switched off are not checked.',
    ciIntro: 'An agent opens a pull request. Is the rule only a sentence, or a check?',
    diff: 'Agent patch', run: 'Open the pull request', prose: 'Rule as prose', proseRule: 'AGENTS.md: "Please always await repo calls."',
    lintSide: 'Rule as lint', lintRule: 'CI runs no-floating-promise',
    merged: 'Merged', mergedNote: 'Nothing checks the sentence. The save may be lost in production.',
    red: 'CI red', redNote: 'Merge blocked until the agent adds await.', waiting: 'waiting for the pull request…',
    loc: (f: Finding) => `line ${f.line}:${f.col}`,
  },
  de: {
    intro: EXERCISE_DE.lint.intro,
    modes: [{ value: 'fix', label: 'Code reparieren' }, { value: 'ci', label: 'Regel als Text vs. Lint' }],
    mode: 'Modus', rules: 'Regeln', editor: 'Petstore-Domain-Code', findings: 'Funde',
    msg: {
      'no-math-random-in-domain': 'Math.random() ist nicht testbar und nicht reproduzierbar. Injiziere einen Id-Generator.',
      'no-floating-promise': 'Dieses Promise wird nicht awaited: Fehler verschwinden und die Reservierung wird evtl. nicht gespeichert.',
      'eqeqeq': 'Nutze === / !== (keine Typumwandlung).',
      'no-explicit-any': 'Vermeide any: Es schaltet den Type-Checker hier ab.',
    } as Record<RuleId, string>,
    none: 'Keine Funde.', hidden: 'Ausgeschaltete Regeln werden nicht geprüft.',
    ciIntro: EXERCISE_DE.lint.ciIntro,
    diff: 'Patch des Agenten', run: 'Pull Request öffnen', prose: 'Regel als Text', proseRule: 'AGENTS.md: „Bitte immer repo-Aufrufe awaiten.“',
    lintSide: 'Regel als Lint', lintRule: 'CI führt no-floating-promise aus',
    merged: 'Gemergt', mergedNote: 'Der Satz wird von nichts geprüft. Das Speichern kann in Produktion verloren gehen.',
    red: 'CI rot', redNote: 'Merge blockiert, bis der Agent await ergänzt.', waiting: 'warte auf den Pull Request …',
    loc: (f: Finding) => `Zeile ${f.line}:${f.col}`,
  },
};

function markedLine(src: string, f: Finding): Node {
  const line = src.split('\n')[f.line - 1] ?? '';
  const span = h('span', {});
  span.innerHTML = `${esc(line.slice(0, f.col - 1))}<mark>${esc(line.slice(f.col - 1, f.col - 1 + f.len))}</mark>${esc(line.slice(f.col - 1 + f.len))}`;
  return span;
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let src = SNIPPET;
  const enabled = new Set<RuleId>(RULE_IDS);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const intro = h('p', { class: 'sim-intro' }, t.intro);
  const fixView = h('div', { class: 'grid', style: 'gap:10px' });
  const ciView = h('div', { class: 'grid', style: 'gap:10px', hidden: true });
  const editorHost = h('div', { class: 'lint-editor' });
  const list = h('div', { class: 'lint-find', 'aria-live': 'polite' });
  const panel = resultPanel(lang);
  const count = h('b');

  const ruleBox = h('div', { class: 'lint-rules', role: 'group', 'aria-label': t.rules });
  for (const r of RULE_IDS) {
    ruleBox.append(h('label', {}, h('input', { type: 'checkbox', checked: true, onchange: (e: Event) => { (e.target as HTMLInputElement).checked ? enabled.add(r) : enabled.delete(r); update(); } }), h('code', {}, r)));
  }
  fixView.append(ruleBox, h('div', { class: 'small muted' }, t.editor), editorHost, h('div', { class: 'sim-card-title' }, t.findings, ' ', count), list, panel.el);

  function update() {
    const fs = lint(src, enabled);
    count.textContent = String(fs.length);
    list.replaceChildren(...(fs.length ? fs.map((f) => h('div', { class: 'lint-row' }, pill('bad', f.rule), h('span', { class: 'small muted' }, t.loc(f)), h('code', {}, markedLine(src, f)), h('span', { class: 'small', style: 'flex-basis:100%' }, t.msg[f.rule])))
      : [h('div', { class: 'small muted' }, enabled.size < RULE_IDS.length ? `${t.none} ${t.hidden}` : t.none)]));
    panel.show(lintView(lintOutcome(src, enabled), src, enabled, lang));
  }
  void codeEditor(editorHost, src, (s) => { src = s; clearTimeout(timer); timer = setTimeout(update, reducedMotion() ? 0 : 200); }, t.editor);

  // Mode 2
  const proseOut = h('div', { class: 'lint-out', hidden: true });
  const lintOut = h('div', { class: 'lint-out', hidden: true });
  const wait = h('div', { class: 'small muted' }, t.waiting);
  const ciPanel = resultPanel(lang);
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: async () => {
    runBtn.disabled = true; wait.hidden = true; ciPanel.clear();
    const fs = lint(PATCH_AFTER, ['no-floating-promise']);
    proseOut.className = 'lint-out ok'; proseOut.hidden = false;
    proseOut.replaceChildren(pill('ok', `✓ ${t.merged}`), h('div', { class: 'small' }, t.mergedNote));
    if (!reducedMotion()) await sleep(700);
    lintOut.className = 'lint-out bad'; lintOut.hidden = false;
    lintOut.replaceChildren(pill('bad', `✗ ${t.red}`), ...fs.map((f) => h('div', { class: 'lint-row' }, h('code', {}, f.rule), h('span', { class: 'small muted' }, t.loc(f)), h('code', {}, markedLine(PATCH_AFTER, f)))), h('div', { class: 'small' }, t.redNote));
    ciPanel.show(ciResultView(lang)); runBtn.disabled = false;
  } }, t.run);
  const lines = PATCH_AFTER.split('\n');
  const before = PATCH_BEFORE.split('\n');
  const diffRows: CodeRow[] = lines.flatMap<CodeRow>((l, i) => l === before[i] ? [{ no: i + 1, html: esc(l) || ' ' }] : [{ no: '−', html: esc(before[i]), cls: 'minus' }, { no: '+', html: esc(l), cls: 'plus' }]);
  ciView.append(h('p', { class: 'sim-intro' }, t.ciIntro), h('div', { class: 'sim-card-title' }, t.diff), codeRows(diffRows, t.diff), h('div', {}, runBtn, ' ', wait),
    h('div', { class: 'lint-two' },
      h('div', {}, h('div', { class: 'sim-card-title' }, h('span', {}, t.prose, ' ', roleTag('nogate', lang))), h('div', { class: 'small', style: 'margin-bottom:6px' }, t.proseRule), proseOut),
      h('div', {}, h('div', { class: 'sim-card-title' }, h('span', {}, t.lintSide, ' ', roleTag('gate', lang))), h('div', { class: 'small', style: 'margin-bottom:6px' }, t.lintRule), lintOut)),
    ciPanel.el);

  const seg = segmented(t.mode, t.modes as { value: 'fix' | 'ci'; label: string }[], 'fix', (v) => { fixView.hidden = v !== 'fix'; ciView.hidden = v !== 'ci'; intro.textContent = v === 'fix' ? t.intro : t.ciIntro; });
  root.append(h('div', { class: 'sim' }, intro, seg, fixView, ciView));
  update();
}
