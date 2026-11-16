import { describe, expect, it } from 'vitest'
import { allocate } from '../src/domain/allocate.ts'
import {
  discountFor,
  findCoupon,
  FREE_SHIPPING_FROM_CENTS,
  priceCart,
  SHIPPING_CENTS,
  shippingFor,
  vatIncluded,
} from '../src/domain/pricing.ts'

const tier10 = findCoupon('TIER10')!
const welcome5 = findCoupon('WILLKOMMEN5')!

describe('findCoupon', () => {
  it('ignoriert Groß-/Kleinschreibung und Leerzeichen', () => {
    expect(findCoupon('  tier10 ')?.code).toBe('TIER10')
    expect(findCoupon('willkommen5')?.code).toBe('WILLKOMMEN5')
  })
  it('kennt unbekannte Codes nicht', () => {
    expect(findCoupon('GRATIS')).toBeUndefined()
  })
})

describe('discountFor', () => {
  it('greift erst ab dem Mindestbestellwert', () => {
    expect(discountFor(tier10, 1_999)).toBe(0)
    expect(discountFor(tier10, 2_000)).toBe(200)
  })
  it('rundet Prozentrabatte ab', () => {
    expect(discountFor(tier10, 2_009)).toBe(200)
  })
  it('deckelt Festbeträge beim Warenwert', () => {
    expect(discountFor(welcome5, 300)).toBe(300)
    expect(discountFor(welcome5, 500)).toBe(500)
    expect(discountFor(welcome5, 501)).toBe(500)
  })
})

describe('shippingFor', () => {
  it('ist für einen leeren Warenkorb gratis', () => {
    expect(shippingFor(0, 0)).toBe(0)
  })
  it('kostet genau unterhalb der Schwelle', () => {
    expect(shippingFor(FREE_SHIPPING_FROM_CENTS - 1, 1)).toBe(SHIPPING_CENTS)
  })
  it('ist genau ab der Schwelle gratis', () => {
    expect(shippingFor(FREE_SHIPPING_FROM_CENTS, 1)).toBe(0)
  })
})

describe('vatIncluded', () => {
  it('rechnet die enthaltene Steuer heraus', () => {
    expect(vatIncluded(11_900)).toBe(1_900)
  })
  it('rundet kaufmännisch an der Halbcent-Grenze', () => {
    expect(vatIncluded(0)).toBe(0)
    expect(vatIncluded(3)).toBe(0) // 0,479 Cent
    expect(vatIncluded(4)).toBe(1) // 0,639 Cent
  })
})

describe('allocate', () => {
  it('verteilt proportional und ohne Restcent', () => {
    expect(allocate(100, [1, 1, 1])).toEqual([33, 33, 34])
  })
  it('kommt mit Gewicht null zurecht', () => {
    expect(allocate(0, [0, 0])).toEqual([0, 0])
    expect(allocate(10, [0, 5])).toEqual([0, 10])
  })
  it('bleibt bei Zwischenprodukten über 2^53 exakt', () => {
    const big = 90_000_000_000
    expect(allocate(big, [big, big, 1]).reduce((a, b) => a + b)).toBe(big)
  })
})

describe('priceCart', () => {
  it('liefert für einen leeren Warenkorb nur Nullen', () => {
    expect(priceCart([])).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      shippingCents: 0,
      totalCents: 0,
      vatCents: 0,
      lineTotalsCents: [],
    })
  })
  it('rechnet Versand ein und legt ihn auf die erste Position', () => {
    const quote = priceCart([1_000, 2_000])
    expect(quote.shippingCents).toBe(SHIPPING_CENTS)
    expect(quote.totalCents).toBe(3_000 + SHIPPING_CENTS)
    expect(quote.lineTotalsCents).toEqual([1_000 + SHIPPING_CENTS, 2_000])
  })
  it('prüft die Versandschwelle nach Abzug des Rabatts', () => {
    expect(priceCart([10_500]).shippingCents).toBe(0)
    expect(priceCart([10_500], tier10).shippingCents).toBe(SHIPPING_CENTS)
  })
  it('verteilt den Rabatt centgenau auf die Positionen', () => {
    const quote = priceCart([3_333, 3_333, 3_334], tier10)
    expect(quote.discountCents).toBe(1_000)
    expect(quote.lineTotalsCents.reduce((a, b) => a + b)).toBe(quote.totalCents)
  })
  it('meldet einen nicht erreichten Mindestbestellwert', () => {
    expect(priceCart([1_999], tier10).couponRejected).toBe('minimum_not_reached')
    expect(priceCart([2_000], tier10).couponRejected).toBeUndefined()
  })
  it('weist ungültige Preise ab', () => {
    expect(() => priceCart([-1])).toThrow(RangeError)
    expect(() => priceCart([1.5])).toThrow('Ungültiger Preis: 1.5')
  })
})
