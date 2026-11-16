/** Four tiny token-based lint rules with line/column. Tolerant: never throws on any input. */
export type RuleId = 'no-math-random-in-domain' | 'no-floating-promise' | 'eqeqeq' | 'no-explicit-any';
export const RULE_IDS: RuleId[] = ['no-math-random-in-domain', 'no-floating-promise', 'eqeqeq', 'no-explicit-any'];

/** Functions known to return promises (qualified or bare names). */
export const KNOWN_ASYNC = new Set(['repo.save', 'repo.delete', 'repo.reserve', 'mailer.send', 'audit.record', 'sendConfirmation']);

export interface Finding { rule: RuleId; line: number; col: number; len: number; token: string }

interface Tok { type: 'ws' | 'com' | 'str' | 'num' | 'id' | 'p'; v: string; s: number }

const RE = /(\s+)|(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\d+(?:\.\d+)?)|([A-Za-z_$][\w$]*)|(===|!==|=>|<=|>=|==|!=|&&|\|\||\?\?|\+\+|--|\+=|-=|\*=|\/=|[\s\S])/y;

export function lexLint(src: string): Tok[] {
  const toks: Tok[] = [];
  let pos = 0;
  while (pos < src.length) {
    RE.lastIndex = pos;
    const m = RE.exec(src);
    if (!m || m[0].length === 0) { pos++; continue; }
    const type = m[1] ? 'ws' : m[2] ? 'com' : m[3] ? 'str' : m[4] ? 'num' : m[5] ? 'id' : 'p';
    toks.push({ type, v: m[0], s: pos });
    pos += m[0].length;
  }
  return toks;
}

function closeParen(sig: Tok[], i: number): number {
  let d = 0;
  for (let k = i; k < sig.length; k++) {
    if (sig[k].v === '(') d++;
    else if (sig[k].v === ')' && --d === 0) return k;
  }
  return -1;
}

export function lint(src: string, enabled: Iterable<RuleId> = RULE_IDS): Finding[] {
  const on = new Set(enabled);
  const sig = lexLint(src).filter((t) => t.type !== 'ws' && t.type !== 'com');
  const raw: { rule: RuleId; s: number; len: number; token: string }[] = [];
  const add = (rule: RuleId, t: Tok, len = t.v.length, token = t.v) => { if (on.has(rule)) raw.push({ rule, s: t.s, len, token }); };

  sig.forEach((t, i) => {
    const p = sig[i - 1], n = sig[i + 1], n2 = sig[i + 2];
    if (t.type === 'id' && t.v === 'Math' && n?.v === '.' && n2?.type === 'id' && n2.v === 'random' && p?.v !== '.') {
      add('no-math-random-in-domain', t, n2.s + n2.v.length - t.s, 'Math.random');
    }
    if (t.type === 'p' && (t.v === '==' || t.v === '!=')) add('eqeqeq', t);
    if (t.type === 'id' && t.v === 'any' && p && (p.v === ':' || p.v === '<' || (p.type === 'id' && p.v === 'as'))) add('no-explicit-any', t);
    if (t.type === 'id' && n) {
      let name = '', open = i + 1;
      if (n.v === '.' && n2?.type === 'id' && sig[i + 3]?.v === '(') { name = `${t.v}.${n2.v}`; open = i + 3; }
      else if (n.v === '(') { name = t.v; open = i + 1; }
      if (name && KNOWN_ASYNC.has(name)) {
        let startIdx = i;
        if (p?.v === '.' && sig[i - 2]?.v === 'this') startIdx = i - 2;
        const before = sig[startIdx - 1];
        const stmtStart = startIdx === 0 || (before.type === 'p' && [';', '{', '}', ')'].includes(before.v)) || (before.type === 'id' && before.v === 'else');
        const close = closeParen(sig, open);
        const chained = close >= 0 && sig[close + 1]?.v === '.';
        if (stmtStart && !chained && !(p?.v === '.' && startIdx === i)) add('no-floating-promise', t, sig[open].s - t.s, name);
      }
    }
  });

  const lineStarts = [0];
  for (let k = 0; k < src.length; k++) if (src[k] === '\n') lineStarts.push(k + 1);
  return raw.map((r) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= r.s) lo = mid; else hi = mid - 1; }
    return { rule: r.rule, line: lo + 1, col: r.s - lineStarts[lo] + 1, len: r.len, token: r.token };
  }).sort((a, b) => a.line - b.line || a.col - b.col);
}

export const SNIPPET = `export async function reservePet(repo: Repo, mailer: Mailer, petId: string, userId: any) {
  const pet = await repo.find(petId);
  if (pet.status == 'reserved') {
    throw new Error('already reserved');
  }
  const ticket = 'R-' + Math.floor(Math.random() * 1e6);
  pet.status = 'reserved';
  repo.save(pet);
  await mailer.send(userId, 'Reserved: ' + ticket);
  return ticket;
}`;

export const SNIPPET_FIXED = SNIPPET
  .replace('userId: any', 'userId: string')
  .replace("== 'reserved'", "=== 'reserved'")
  .replace('Math.floor(Math.random() * 1e6)', 'crypto.randomUUID()')
  .replace('  repo.save(pet);', '  await repo.save(pet);');

/** Solved when no rule fires and the learner kept the function intact. */
export function isSolved(src: string): boolean {
  return lint(src).length === 0 && src.includes('reservePet') && /\brepo\s*\.\s*save\s*\(/.test(src) && sigCount(src) >= 40;
}
const sigCount = (src: string) => lexLint(src).filter((t) => t.type !== 'ws' && t.type !== 'com').length;

export const PATCH_BEFORE = `export async function cancelReservation(repo: Repo, petId: string) {
  const pet = await repo.find(petId);
  pet.status = 'available';
  await repo.save(pet);
  return pet;
}`;
export const PATCH_AFTER = PATCH_BEFORE.replace('  await repo.save(pet);', '  repo.save(pet);');
