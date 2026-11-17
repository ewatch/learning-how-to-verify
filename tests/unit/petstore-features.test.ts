import { describe, expect, it } from 'vitest';
import { PARTS } from '../../src/data/petstore';
import { FEATURES, featureOf } from '../../src/data/petstore-features';
import { IMPLS as FEE_IMPLS } from '../../src/sim/engine/unitsim';
import { OLD as VOUCHER_PRICE } from '../../src/sim/engine/differential';
import { IMPLS as SPLIT_IMPLS } from '../../src/sim/engine/pbt';
import { petstoreMarkdown } from '../../src/lib/page-markdown';

const adoptionFee = FEE_IMPLS.find((i) => !i.buggy)!.fn;
const allocate = SPLIT_IMPLS.cumulative.fn;
const behaviourParts = PARTS.filter((p) => p.kind === 'operation' || p.kind === 'rule');

const EN_KEYWORD = /^(Feature|Scenario Outline|Scenario|Examples|Given|When|Then|And|But)\b/;
const DE_STEP = /^(Angenommen|Wenn|Dann|Und|Aber) /;
const DE_BLOCK = /^(Funktionalität|Szenariogrundriss|Szenario|Beispiele):/;

/** Rows of every Examples/Beispiele table in a feature, as objects keyed by the header cells. */
function examples(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let header: string[] | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (/^(Examples|Beispiele):/.test(line)) { header = null; continue; }
    if (!line.startsWith('|')) { if (line) header = null; continue; }
    const cells = line.slice(1, -1).split('|').map((c) => c.trim());
    if (!header) header = cells;
    else rows.push(Object.fromEntries(header.map((h, i) => [h, cells[i]])));
  }
  return rows;
}

const species = (s: string) => ({ dog: 'dog', cat: 'cat', 'ein Hund': 'dog', 'eine Katze': 'cat' } as const)[s as 'dog'];

describe('petstore features (Gherkin)', () => {
  it('every operation and every rule has a feature in both languages, and no other part has one', () => {
    for (const p of PARTS) {
      const f = featureOf(p.id);
      if (p.kind === 'operation' || p.kind === 'rule') {
        expect(f, p.id).toBeDefined();
        expect(f!.text.en, `${p.id} en`).toMatch(/^Feature: \S/);
        expect(f!.text.de, `${p.id} de`).toMatch(/^# language: de\nFunktionalität: \S/);
        for (const loc of ['en', 'de'] as const) expect(f!.text[loc], `${p.id} ${loc} has a scenario`).toMatch(/^ {2}(Scenario|Szenario)/m);
        expect(f!.file, p.id).toMatch(/^[a-z-]+\.feature$/);
      } else expect(f, p.id).toBeUndefined();
    }
    expect(Object.keys(FEATURES).length).toBe(behaviourParts.length);
  });

  it('English features use English keywords only', () => {
    for (const [id, f] of Object.entries(FEATURES)) {
      expect(f.text.en, id).not.toContain('# language:');
      for (const line of f.text.en.split('\n').map((l) => l.trim())) {
        expect(DE_STEP.test(line) || DE_BLOCK.test(line), `${id}: ${line}`).toBe(false);
      }
    }
  });

  it('German features start with "# language: de" and use German keywords only', () => {
    for (const [id, f] of Object.entries(FEATURES)) {
      const lines = f.text.de.split('\n');
      expect(lines[0], id).toBe('# language: de');
      for (const raw of lines.slice(1)) {
        const line = raw.trim();
        if (!line || line.startsWith('#') || line.startsWith('|')) continue;
        expect(EN_KEYWORD.test(line), `${id}: English keyword in "${line}"`).toBe(false);
        // steps and example headers are indented by 4, block keywords by 0 or 2; description lines contain no keyword colon
        if (raw.startsWith('    ')) expect(DE_STEP.test(line) || line === 'Beispiele:', `${id}: "${line}"`).toBe(true);
        else if (/^\p{L}+:/u.test(line)) expect(DE_BLOCK.test(line), `${id}: "${line}"`).toBe(true);
      }
    }
  });

  it('the fee Examples table matches the fee function of the site in both languages', () => {
    for (const loc of ['en', 'de'] as const) {
      const rows = examples(FEATURES['fee-rules'].text[loc]);
      expect(rows.length, loc).toBeGreaterThanOrEqual(6);
      const sp = loc === 'en' ? 'species' : 'art', age = loc === 'en' ? 'age' : 'alter', fee = loc === 'en' ? 'fee' : 'gebühr';
      for (const r of rows) {
        expect(species(r[sp]), `${loc} ${r[sp]}`).toBeDefined();
        expect(adoptionFee(species(r[sp]), Number(r[age])), `${loc} ${r[sp]} ${r[age]}`).toBe(Number(r[fee]));
      }
      // the table covers both species and both age boundaries
      const ages = new Set(rows.map((r) => Number(r[age])));
      for (const a of [0, 1, 7, 8]) expect(ages.has(a), `${loc} age ${a}`).toBe(true);
      expect(new Set(rows.map((r) => species(r[sp]))).size).toBe(2);
    }
  });

  it('the rejected ages are rejected by the fee function', () => {
    for (const loc of ['en', 'de'] as const) {
      const rows = examples(FEATURES['valid-age'].text[loc]);
      expect(rows.length, loc).toBeGreaterThan(0);
      for (const r of rows) expect(() => adoptionFee('dog', Number(r.age ?? r.alter)), `${loc} ${JSON.stringify(r)}`).toThrow();
    }
  });

  it('single fee scenarios match the fee function', () => {
    const re = { en: /a (dog|cat) of (\d+) years\n[^]*?the fee is (\d+) cents/g, de: /(ein Hund|eine Katze) mit (\d+) Jahren\n[^]*?die Gebühr (\d+) Cent/g };
    for (const id of ['fee', 'valid-age'] as const) for (const loc of ['en', 'de'] as const) {
      const hits = [...FEATURES[id].text[loc].matchAll(re[loc])];
      expect(hits.length, `${id} ${loc}`).toBeGreaterThan(0);
      for (const [, s, a, fee] of hits) expect(adoptionFee(species(s), Number(a)), `${id} ${loc} ${s} ${a}`).toBe(Number(fee));
    }
  });

  it('voucher and discount amounts match the engine functions', () => {
    const re = { en: /a price of (\d+) cents?\n.*"(\w+)"\n.*the price is (\d+) cents?/g, de: /ein Preis von (\d+) Cent\n.*"(\w+)".*\n.*der Preis (\d+) Cent/g };
    for (const id of ['voucher', 'discount-sum'] as const) for (const loc of ['en', 'de'] as const) {
      const hits = [...FEATURES[id].text[loc].matchAll(re[loc])];
      expect(hits.length, `${id} ${loc}`).toBeGreaterThan(0);
      for (const [, cents, code, price] of hits) expect(VOUCHER_PRICE.fn(Number(cents), code), `${id} ${loc} ${cents} ${code}`).toBe(Number(price));
    }
    const nums = (s: string) => s.split(/,|and|und/).map((x) => Number(x.trim()));
    const split = {
      en: /the fees ([\d, and]+) cents\n.*discount of (\d+) cents\n.*shares are ([\d, and]+) cents/g,
      de: /den Gebühren ([\d, und]+) Cent\n.*Rabatt von (\d+) Cent .*\n.*Rabattanteile ([\d, und]+) Cent/g,
    };
    for (const id of ['checkout', 'discount-sum'] as const) for (const loc of ['en', 'de'] as const) {
      const hits = [...FEATURES[id].text[loc].matchAll(split[loc])];
      expect(hits.length, `${id} ${loc}`).toBe(1);
      for (const [, fees, discount, shares] of hits) expect(allocate(Number(discount), nums(fees)), `${id} ${loc}`).toEqual(nums(shares));
    }
  });

  it('the Markdown twin contains every feature as a gherkin block', () => {
    for (const loc of ['en', 'de'] as const) {
      const md = petstoreMarkdown(loc);
      for (const f of Object.values(FEATURES)) expect(md, `${loc} ${f.file}`).toContain('```gherkin\n' + f.text[loc] + '\n```');
    }
  });
});
