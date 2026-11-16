/**
 * Design-by-contract pipeline: checkout(cart) -> allocate(discount, weights) -> renderInvoice(shares).
 * Pure logic; the UI only renders. Money is in cents.
 */
export type InputId = 'normal' | 'negDiscount' | 'tooBig' | 'empty' | 'negWeight';
export type Clause = 'weightsNonEmpty' | 'amountNonNeg' | 'weightsNonNeg' | 'amountLeTotal' | 'sumShares' | 'sharesNonNeg';
export type StepStatus = 'ok' | 'bad' | 'tainted' | 'skipped';
export type Anomaly = 'negativeTotal' | 'surcharge' | 'negativeLine' | 'nan' | null;

export interface Scenario { id: InputId; prices: number[]; discount: number }

export const SCENARIOS: Scenario[] = [
  { id: 'normal', prices: [1000, 2000, 3000], discount: 600 },
  { id: 'negDiscount', prices: [1000, 2000, 3000], discount: -300 },
  { id: 'tooBig', prices: [1000, 2000, 3000], discount: 9000 },
  { id: 'empty', prices: [], discount: 500 },
  { id: 'negWeight', prices: [1000, -500, 2000], discount: 300 },
];
export const INPUT_IDS: InputId[] = SCENARIOS.map((s) => s.id);

export const ALLOCATE_SRC = `function allocate(amount, weights) {
  // preconditions
  assert(weights.length > 0);
  assert(amount >= 0);
  assert(weights.every((w) => w >= 0));
  assert(amount <= sum(weights));
  const shares = split(amount, weights);
  // postconditions
  assert(sum(shares) === amount);
  assert(shares.every((s) => s >= 0));
  return shares;
}`;

/** line (0-based) of each clause in ALLOCATE_SRC */
export const CLAUSE_LINE: Record<Clause, number> = {
  weightsNonEmpty: 2, amountNonNeg: 3, weightsNonNeg: 4, amountLeTotal: 5, sumShares: 8, sharesNonNeg: 9,
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** The (correct) allocation: floor shares, remainder to the last line. No checks. */
export function split(amount: number, weights: number[]): number[] {
  const total = sum(weights);
  const shares = weights.map((w) => Math.floor((amount * w) / total));
  if (shares.length) shares[shares.length - 1] += amount - sum(shares);
  return shares;
}

export function preconditionViolation(amount: number, weights: number[]): Clause | null {
  if (!(weights.length > 0)) return 'weightsNonEmpty';
  if (!(amount >= 0)) return 'amountNonNeg';
  if (!weights.every((w) => w >= 0)) return 'weightsNonNeg';
  if (!(amount <= sum(weights))) return 'amountLeTotal';
  return null;
}

export function postconditionViolation(amount: number, shares: number[]): Clause | null {
  if (sum(shares) !== amount) return 'sumShares';
  if (!shares.every((s) => s >= 0)) return 'sharesNonNeg';
  return null;
}

export interface Invoice { lines: { price: number; discount: number }[]; subtotal: number; total: number; perItem: number }

export function renderInvoice(prices: number[], shares: number[]): Invoice {
  const lines = prices.map((price, i) => ({ price, discount: shares[i] ?? 0 }));
  const subtotal = sum(prices);
  return { lines, subtotal, total: subtotal - sum(shares), perItem: sum(shares) / shares.length };
}

export function invoiceAnomaly(inv: Invoice): Anomaly {
  if (Number.isNaN(inv.perItem) || Number.isNaN(inv.total)) return 'nan';
  if (inv.total < 0) return 'negativeTotal';
  if (inv.total > inv.subtotal) return 'surcharge';
  if (inv.lines.some((l) => l.discount < 0)) return 'negativeLine';
  return null;
}

export interface RunResult {
  scenario: Scenario;
  contracts: boolean;
  steps: [StepStatus, StepStatus, StepStatus];
  /** index (0..2) of the red box, or null when everything is fine */
  failingStep: 0 | 1 | 2 | null;
  /** the violated clause (contracts on) or the root cause (contracts off) */
  cause: Clause | null;
  /** the root-cause step is always allocate (index 1) when cause is set */
  shares: number[] | null;
  invoice: Invoice | null;
  anomaly: Anomaly;
}

export function run(id: InputId, contracts: boolean): RunResult {
  const scenario = SCENARIOS.find((s) => s.id === id)!;
  const weights = scenario.prices; // checkout: weights are the line prices
  const cause = preconditionViolation(scenario.discount, weights);
  if (contracts && cause) {
    return { scenario, contracts, steps: ['ok', 'bad', 'skipped'], failingStep: 1, cause, shares: null, invoice: null, anomaly: null };
  }
  const shares = split(scenario.discount, weights);
  const invoice = renderInvoice(scenario.prices, shares);
  const anomaly = invoiceAnomaly(invoice);
  if (contracts) {
    const post = postconditionViolation(scenario.discount, shares);
    if (post) return { scenario, contracts, steps: ['ok', 'bad', 'skipped'], failingStep: 1, cause: post, shares, invoice: null, anomaly: null };
  }
  if (anomaly) return { scenario, contracts, steps: ['ok', 'tainted', 'bad'], failingStep: 2, cause, shares, invoice, anomaly };
  return { scenario, contracts, steps: ['ok', 'ok', 'ok'], failingStep: null, cause: null, shares, invoice, anomaly: null };
}
