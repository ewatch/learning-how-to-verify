import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { findCoupon, priceCart, type Coupon } from '../../src/domain/pricing.ts'
import { carts } from './carts.ts'
import { compare } from './classify.ts'
import { legacyTotalEuro } from './legacy-pricing.ts'

const tier10 = findCoupon('TIER10') as Extract<Coupon, { kind: 'percent' }>

describe('Refactoring: alte Gleitkomma- gegen neue Cent-Rechnung', () => {
  it('ist ohne Gutschein identisch', () => {
    fc.assert(
      fc.property(carts, (cart) => {
        expect(Math.round(legacyTotalEuro(cart.map((cents) => cents / 100), 0) * 100)).toBe(priceCart(cart).totalCents)
      }),
    )
  })

  it('jede Abweichung mit Gutschein hat eine bekannte Ursache', () => {
    fc.assert(
      fc.property(carts, (cart) => {
        expect(compare(cart, tier10).kind).not.toBe('unbekannt')
      }),
      { numRuns: 5_000 },
    )
  })

  it('dokumentiert die drei Unterschiede an je einem Beispiel', () => {
    expect(compare([2_001], tier10)).toMatchObject({ kind: 'gleich' })
    expect(compare([28_897], tier10)).toMatchObject({ kind: 'rundung', gap: -1 })
    expect(compare([1_985], tier10)).toMatchObject({ kind: 'mindestbestellwert', gap: -198 })
    expect(compare([11_111], tier10)).toMatchObject({ kind: 'versandschwelle', legacyCents: 10_499, newCents: 10_000 })
  })
})
