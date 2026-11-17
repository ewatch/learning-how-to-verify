// Snapshot-test exercise: a recorded invoice snapshot, five agent changes, line diffs and scoring.
import type { Outcome } from './outcome';
export type Bi = { en: string; de: string };
export interface Adoption { pet: string; species: string; feeCents: number; voucherPercent: number; date: string }

export const ADOPTION: Adoption = { pet: 'Bella', species: 'dog', feeCents: 12095, voucherPercent: 10, date: '2026-03-07' };

const eur = (cents: number) => `${(cents / 100).toFixed(2)} €`;

export interface Variant { dateFmt: 'iso' | 'de'; footer: boolean; voucherRound: 'round' | 'floor'; showVoucher: boolean; feeLabel: string }
export const BASE_VARIANT: Variant = { dateFmt: 'iso', footer: false, voucherRound: 'round', showVoucher: true, feeLabel: 'Fe' };

/** The renderer under test. Variants model what an agent's change does to its output. */
export function renderInvoice(a: Adoption, v: Variant = BASE_VARIANT): string {
  const voucher = v.voucherRound === 'round' ? Math.round((a.feeCents * a.voucherPercent) / 100) : Math.floor((a.feeCents * a.voucherPercent) / 100);
  const total = a.feeCents - Math.round((a.feeCents * a.voucherPercent) / 100) + (Math.round((a.feeCents * a.voucherPercent) / 100) - voucher);
  const date = v.dateFmt === 'iso' ? a.date : a.date.split('-').reverse().join('.');
  const row = (k: string, val: string) => `${(k + ':').padEnd(9)} ${val}`;
  const lines = ['PETSTORE INVOICE', row('Pet', `${a.pet} (${a.species})`), row('Date', date), row(v.feeLabel, eur(a.feeCents))];
  if (v.showVoucher) lines.push(row('Voucher', `-${eur(voucher)}`));
  lines.push(row('Total', eur(total)));
  if (v.footer) lines.push('', 'Thank you for adopting!');
  return lines.join('\n');
}

/** The recorded snapshot (what a human approved earlier). */
export const SNAPSHOT = renderInvoice(ADOPTION);

export type Verdict = 'approve' | 'reject';
export interface Change { id: string; intended: boolean; title: Bi; before: string; after: string; variant: Partial<Variant>; why: Bi }

export const CHANGES: Change[] = [
  { id: 'footer', intended: true, title: { en: 'Add a thank-you footer', de: 'Dankes-Fußzeile hinzufügen' },
    before: "return lines.join('\\n');", after: "lines.push('', 'Thank you for adopting!');\nreturn lines.join('\\n');", variant: { footer: true },
    why: { en: 'Intended: the task asked for a footer, and only the footer changed.', de: 'Gewollt: Die Aufgabe verlangte eine Fußzeile, und nur diese hat sich geändert.' } },
  { id: 'date', intended: true, title: { en: 'Use a German date format', de: 'Deutsches Datumsformat verwenden' },
    before: 'const date = a.date;', after: "const date = a.date.split('-').reverse().join('.');", variant: { dateFmt: 'de' },
    why: { en: 'Intended: the date format was the requested change; amounts are untouched.', de: 'Gewollt: Das Datumsformat war die gewünschte Änderung; Beträge sind unberührt.' } },
  { id: 'rounding', intended: false, title: { en: 'Refactor the voucher calculation', de: 'Gutschein-Berechnung umbauen' },
    before: 'const voucher = Math.round(fee * pct / 100);', after: 'const voucher = Math.floor(fee * pct / 100);', variant: { voucherRound: 'floor' },
    why: { en: 'Bug: a "refactor" changed rounding, so the customer is charged 1 cent more.', de: 'Fehler: Ein „Refactoring“ hat die Rundung geändert, der Kunde zahlt 1 Cent mehr.' } },
  { id: 'voucher', intended: false, title: { en: 'Clean up the invoice lines', de: 'Rechnungszeilen aufräumen' },
    before: "lines.push(row('Voucher', …));", after: '// voucher line removed', variant: { showVoucher: false },
    why: { en: 'Bug: the voucher line vanished. The customer no longer sees why the total is lower.', de: 'Fehler: Die Gutschein-Zeile ist verschwunden. Der Kunde sieht nicht mehr, warum die Summe niedriger ist.' } },
  { id: 'typo', intended: true, title: { en: 'Fix a typo in a label', de: 'Tippfehler im Label korrigieren' },
    before: "row('Fe', …)", after: "row('Fee', …)", variant: { feeLabel: 'Fee' },
    why: { en: 'Intended: "Fe" was a typo, and the fix touches exactly that label.', de: 'Gewollt: „Fe“ war ein Tippfehler, und die Korrektur betrifft genau dieses Label.' } },
];

export type DiffOp = 'same' | 'add' | 'del';
export interface DiffLine { op: DiffOp; text: string }

/** Line diff via longest common subsequence. */
export function diffLines(a: string, b: string): DiffLine[] {
  const x = a.split('\n'), y = b.split('\n');
  const dp: number[][] = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--)
    dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out.push({ op: 'same', text: x[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ op: 'del', text: x[i++] });
    else out.push({ op: 'add', text: y[j++] });
  }
  while (i < x.length) out.push({ op: 'del', text: x[i++] });
  while (j < y.length) out.push({ op: 'add', text: y[j++] });
  return out;
}

export function outputFor(c: Change): string { return renderInvoice(ADOPTION, { ...BASE_VARIANT, ...c.variant }); }
export function diffFor(c: Change): DiffLine[] { return diffLines(SNAPSHOT, outputFor(c)); }
/** The trap: when the agent re-records the snapshot, the test compares output with itself. */
export function diffAfterAutoUpdate(c: Change): DiffLine[] { const o = outputFor(c); return diffLines(o, o); }
export const changed = (d: DiffLine[]) => d.some((l) => l.op !== 'same');

export interface Score { results: { id: string; decided: boolean; correct: boolean }[]; correct: number; decided: number; total: number }
export function score(decisions: Record<string, Verdict | undefined>, changes: Change[] = CHANGES): Score {
  const results = changes.map((c) => {
    const d = decisions[c.id];
    return { id: c.id, decided: d !== undefined, correct: d !== undefined && (d === 'approve') === c.intended };
  });
  return { results, correct: results.filter((r) => r.correct).length, decided: results.filter((r) => r.decided).length, total: changes.length };
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type SnapshotCause =
  | 'all-correct' // every bug rejected, every wanted change approved
  | 'approved-bug' // at least one bug was approved: the snapshot now records the wrong output
  | 'rejected-wanted' // only wanted changes were rejected: no bug ships, but wanted work is lost
  | 'auto-updated'; // the agent re-recorded every snapshot: all tests green, the bugs ship

export interface SnapshotValues {
  correct: number;
  total: number;
  approvedBugs: string[];
  rejectedWanted: string[];
  /** bugs that end up in the recorded snapshot */
  shipped: string[];
  /** the change the explanation is about, with the lines it removes from / adds to the snapshot */
  focus?: { id: string; index: number; removed: string[]; added: string[] };
}
export type SnapshotOutcome = Outcome<SnapshotCause, SnapshotValues>;

export function changedLines(c: Change): { removed: string[]; added: string[] } {
  const d = diffFor(c);
  return { removed: d.filter((l) => l.op === 'del').map((l) => l.text), added: d.filter((l) => l.op === 'add').map((l) => l.text) };
}
const focusOn = (c: Change) => ({ id: c.id, index: CHANGES.indexOf(c), ...changedLines(c) });

/** Result once every change is decided, or at once when the agent updates snapshots itself. Null while decisions are open. */
export function snapshotOutcome(decisions: Record<string, Verdict | undefined>, auto: boolean, changes: Change[] = CHANGES): SnapshotOutcome | null {
  const bugs = changes.filter((c) => !c.intended);
  if (auto) {
    return { status: 'warn', causeId: 'auto-updated', values: { correct: 0, total: changes.length, approvedBugs: [], rejectedWanted: [], shipped: bugs.map((c) => c.id), focus: bugs[0] && focusOn(bugs[0]) } };
  }
  const s = score(decisions, changes);
  if (s.decided < s.total) return null;
  const approvedBugs = bugs.filter((c) => decisions[c.id] === 'approve');
  const rejectedWanted = changes.filter((c) => c.intended && decisions[c.id] === 'reject');
  const values: SnapshotValues = { correct: s.correct, total: s.total, approvedBugs: approvedBugs.map((c) => c.id), rejectedWanted: rejectedWanted.map((c) => c.id), shipped: approvedBugs.map((c) => c.id) };
  if (approvedBugs.length) return { status: 'fail', causeId: 'approved-bug', values: { ...values, focus: focusOn(approvedBugs[0]) } };
  if (rejectedWanted.length) return { status: 'fail', causeId: 'rejected-wanted', values: { ...values, focus: focusOn(rejectedWanted[0]) } };
  return { status: 'pass', causeId: 'all-correct', values: { ...values, focus: bugs[0] && focusOn(bugs[0]) } };
}

const TEST = 'renderInvoice > matches the recorded invoice';

/** A Vitest snapshot mismatch for one change, as the agent sees it before anyone decides. */
export function vitestSnapshotReport(c: Change): string {
  const d = diffFor(c);
  const last = d.length - 1;
  const body = d.map((l, i) => `${l.op === 'del' ? '-' : l.op === 'add' ? '+' : ' '} ${i === 0 ? '"' : ''}${l.text}${i === last ? '"' : ''}`);
  return [` FAIL  invoice.test.ts > ${TEST}`, `Error: Snapshot \`${TEST} 1\` mismatched`, '', '- Expected', '+ Received', '', ...body].join('\n');
}

/** What the agent sees after it re-recorded the snapshots itself (vitest -u). */
export function vitestUpdatedReport(n: number): string {
  return ['$ vitest run -u', ` ✓ invoice.test.ts (${n} tests)`, '', ` Snapshots  ${n} updated`, ' Test Files  1 passed (1)', `      Tests  ${n} passed (${n})`].join('\n');
}
