import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { allocate } from '../../src/domain/allocate.ts'

const generated = new URL('../../verification/dafny/generated/Allocate.cjs', import.meta.url).pathname

describe.skipIf(!existsSync(generated))('Dafny-Modell gegen TypeScript', () => {
  it('rechnet für beliebige Eingaben dasselbe wie der bewiesene Code', () => {
    const { allocateVerified } = createRequire(import.meta.url)(generated) as {
      allocateVerified: (amount: number, weights: number[]) => number[]
    }
    const safe = fc.maxSafeNat().map((n) => n % 1_000_000_000_000)
    const input = fc.array(safe, { maxLength: 12 }).chain((weights) => {
      const total = weights.reduce((a, b) => a + b, 0)
      return fc.record({ weights: fc.constant(weights), amount: fc.maxSafeNat().map((n) => n % (total + 1)) })
    })

    fc.assert(
      fc.property(input, ({ amount, weights }) => {
        expect(allocate(amount, weights)).toEqual(allocateVerified(amount, weights))
      }),
      { numRuns: 500 },
    )
  })
})
