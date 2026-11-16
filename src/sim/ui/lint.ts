import { h, codeEditor, codeRows, pill, segmented, reducedMotion, sleep, esc, type Lang, type CodeRow } from './kit';
import { lint, isSolved, SNIPPET, RULE_IDS, PATCH_BEFORE, PATCH_AFTER, type RuleId, type Finding } from '../engine/lint';
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
    solved: 'All findings fixed.', lesson: 'A lint rule checks every line, every time. Nobody has to remember it.',
    ciIntro: 'An agent opens a pull request. Is the rule only a sentence, or a check?',
    diff: 'Agent patch', run: 'Open the pull request', prose: 'Rule as prose', proseRule: 'AGENTS.md: "Please always await repo calls."',
    lintSide: 'Rule as lint', lintRule: 'CI runs no-floating-promise',
    merged: 'Merged', mergedNote: 'Nothing checks the sentence. The save may be lost in production.',
    red: 'CI red', redNote: 'Merge blocked until the agent adds await.', waiting: 'waiting for the pull request…',
    ciLesson: 'A rule only written down is a hope; a rule in CI is enforced.',
    loc: (f: Finding) => `line ${f.line}:${f.col}`,
  },
  de: {
    intro: 'Dieser Code hat Probleme, die ein Linter sieht. Behebe jeden Fund im Editor.',
    modes: [{ value: 'fix', label: 'Code reparieren' }, { value: 'ci', label: 'Regel als Text vs. Lint' }],
    mode: 'Modus', rules: 'Regeln', editor: 'Petstore-Domain-Code', findings: 'Funde',
    msg: {
      'no-math-random-in-domain': 'Math.random() ist nicht testbar und nicht reproduzierbar. Injiziere einen Id-Generator.',
      'no-floating-promise': 'Dieses Promise wird nicht awaited: Fehler verschwinden und die Reservierung wird evtl. nicht gespeichert.',
      'eqeqeq': 'Nutze === / !== (keine Typumwandlung).',
      'no-explicit-any': 'Vermeide any: Es schaltet den Type-Checker hier ab.',
    } as Record<RuleId, string>,
    none: 'Keine Funde.', hidden: 'Ausgeschaltete Regeln werden nicht geprüft.',
    solved: 'Alle Funde behoben.', lesson: 'Eine Lint-Regel prüft jede Zeile, jedes Mal. Niemand muss daran denken.',
    ciIntro: 'Ein Agent öffnet einen Pull Request. Ist die Regel nur ein Satz oder eine Prüfung?',
    diff: 'Patch des Agenten', run: 'Pull Request öffnen', prose: 'Regel als Text', proseRule: 'AGENTS.md: „Bitte immer repo-Aufrufe awaiten.“',
    lintSide: 'Regel als Lint', lintRule: 'CI führt no-floating-promise aus',
    merged: 'Gemergt', mergedNote: 'Der Satz wird von nichts geprüft. Das Speichern kann in Produktion verloren gehen.',
    red: 'CI rot', redNote: 'Merge blockiert, bis der Agent await ergänzt.', waiting: 'warte auf den Pull Request …',
    ciLesson: 'Eine nur aufgeschriebene Regel ist eine Hoffnung; eine Regel in der CI wird durchgesetzt.',
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
  const status = h('div', { class: 'sim-callout ok', hidden: true });
  const count = h('b');

  const ruleBox = h('div', { class: 'lint-rules', role: 'group', 'aria-label': t.rules });
  for (const r of RULE_IDS) {
    ruleBox.append(h('label', {}, h('input', { type: 'checkbox', checked: true, onchange: (e: Event) => { (e.target as HTMLInputElement).checked ? enabled.add(r) : enabled.delete(r); update(); } }), h('code', {}, r)));
  }
  fixView.append(ruleBox, h('div', { class: 'small muted' }, t.editor), editorHost, h('div', { class: 'sim-card-title' }, t.findings, ' ', count), list, status);

  function update() {
    const fs = lint(src, enabled);
    count.textContent = String(fs.length);
    list.replaceChildren(...(fs.length ? fs.map((f) => h('div', { class: 'lint-row' }, pill('bad', f.rule), h('span', { class: 'small muted' }, t.loc(f)), h('code', {}, markedLine(src, f)), h('span', { class: 'small', style: 'flex-basis:100%' }, t.msg[f.rule])))
      : [h('div', { class: 'small muted' }, enabled.size < RULE_IDS.length ? `${t.none} ${t.hidden}` : t.none)]));
    const done = isSolved(src);
    status.hidden = !done;
    status.replaceChildren(h('b', {}, `✓ ${t.solved} `), t.lesson);
  }
  void codeEditor(editorHost, src, (s) => { src = s; clearTimeout(timer); timer = setTimeout(update, reducedMotion() ? 0 : 200); }, t.editor);

  // Mode 2
  const proseOut = h('div', { class: 'lint-out', hidden: true });
  const lintOut = h('div', { class: 'lint-out', hidden: true });
  const wait = h('div', { class: 'small muted' }, t.waiting);
  const ciLesson = h('div', { class: 'sim-callout ok', hidden: true }, t.ciLesson);
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: async () => {
    runBtn.disabled = true; wait.hidden = true;
    const fs = lint(PATCH_AFTER, ['no-floating-promise']);
    proseOut.className = 'lint-out ok'; proseOut.hidden = false;
    proseOut.replaceChildren(pill('ok', `✓ ${t.merged}`), h('div', { class: 'small' }, t.mergedNote));
    if (!reducedMotion()) await sleep(700);
    lintOut.className = 'lint-out bad'; lintOut.hidden = false;
    lintOut.replaceChildren(pill('bad', `✗ ${t.red}`), ...fs.map((f) => h('div', { class: 'lint-row' }, h('code', {}, f.rule), h('span', { class: 'small muted' }, t.loc(f)), h('code', {}, markedLine(PATCH_AFTER, f)))), h('div', { class: 'small' }, t.redNote));
    ciLesson.hidden = false; runBtn.disabled = false;
  } }, t.run);
  const lines = PATCH_AFTER.split('\n');
  const before = PATCH_BEFORE.split('\n');
  const diffRows: CodeRow[] = lines.flatMap<CodeRow>((l, i) => l === before[i] ? [{ no: i + 1, html: esc(l) || ' ' }] : [{ no: '−', html: esc(before[i]), cls: 'minus' }, { no: '+', html: esc(l), cls: 'plus' }]);
  ciView.append(h('p', { class: 'sim-intro' }, t.ciIntro), h('div', { class: 'sim-card-title' }, t.diff), codeRows(diffRows, t.diff), h('div', {}, runBtn, ' ', wait),
    h('div', { class: 'lint-two' },
      h('div', {}, h('div', { class: 'sim-card-title' }, t.prose), h('div', { class: 'small', style: 'margin-bottom:6px' }, t.proseRule), proseOut),
      h('div', {}, h('div', { class: 'sim-card-title' }, t.lintSide), h('div', { class: 'small', style: 'margin-bottom:6px' }, t.lintRule), lintOut)),
    ciLesson);

  const seg = segmented(t.mode, t.modes as { value: 'fix' | 'ci'; label: string }[], 'fix', (v) => { fixView.hidden = v !== 'fix'; ciView.hidden = v !== 'ci'; intro.textContent = v === 'fix' ? t.intro : t.ciIntro; });
  root.append(h('div', { class: 'sim' }, intro, seg, fixView, ciView));
  update();
}
