import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { parseSearch, printSearch, type Query } from '../../src/domain/search.ts'

const value = fc.string({ minLength: 0, maxLength: 12, unit: 'binary' })
const leaf: fc.Arbitrary<Query> = fc.oneof(
  value.map((v) => ({ t: 'word' as const, value: v })),
  fc.record({
    t: fc.constant('field' as const),
    field: fc.constantFrom('name' as const, 'tag' as const, 'category' as const, 'status' as const),
    value,
  }),
  fc.record({
    t: fc.constant('price' as const),
    op: fc.constantFrom('<' as const, '<=' as const, '>' as const, '>=' as const),
    cents: fc.integer({ min: 0, max: 999_999_999 }),
  }),
)

const { query } = fc.letrec<{ query: Query }>((tie) => ({
  query: fc.oneof(
    { depthSize: 'small', withCrossShrink: true },
    leaf,
    tie('query').map((q) => ({ t: 'not' as const, query: q })),
    fc.record({ t: fc.constant('and' as const), left: tie('query'), right: tie('query') }),
    fc.record({ t: fc.constant('or' as const), left: tie('query'), right: tie('query') }),
  ),
}))

/** Doppelte Verneinung und Ähnliches bleiben im AST erhalten; verglichen wird strukturell. */
describe('parseSearch und printSearch', () => {
  it('Drucken und erneutes Parsen ergibt denselben Ausdruck', () => {
    fc.assert(
      fc.property(query, (q) => {
        const printed = printSearch(q)
        fc.pre(printed.length <= 500)
        const parsed = parseSearch(printed)
        fc.pre(parsed.ok || parsed.error !== 'Ausdruck zu tief verschachtelt')
        expect(parsed).toEqual({ ok: true, query: q })
      }),
      { numRuns: 2_000 },
    )
  })

  it('wirft bei beliebigem Text nie', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 80, unit: 'binary' }), (input) => {
        parseSearch(input)
      }),
    )
  })
})
