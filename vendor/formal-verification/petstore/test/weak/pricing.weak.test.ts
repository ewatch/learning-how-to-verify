import { expect, it } from 'vitest'
import { allocate } from '../../src/domain/allocate.ts'
import { discountFor, findCoupon, priceCart, shippingFor, vatIncluded } from '../../src/domain/pricing.ts'

// Absichtlich schwach: Jede Zeile wird ausgeführt, aber kaum etwas wirklich
// geprüft. Nur für das Showcase, siehe stryker.weak.config.json.
it('berechnet einen Warenkorb', () => {
  const quote = priceCart([20_000, 30_000], findCoupon('TIER10'))
  expect(quote.totalCents).toBeGreaterThan(0)
  expect(quote.lineTotalsCents).toHaveLength(2)
})

it('läuft auch ohne Gutschein und unterhalb des Mindestwerts', () => {
  expect(priceCart([]).totalCents).toBe(0)
  expect(priceCart([1_000], findCoupon('TIER10')).couponRejected).toBeDefined()
  expect(priceCart([1_000], findCoupon('WILLKOMMEN5')).discountCents).toBeGreaterThan(0)
  expect(() => priceCart([-1])).toThrow()
})

it('die Hilfsfunktionen liefern Zahlen', () => {
  expect(discountFor(findCoupon('TIER10')!, 5_000)).toBeGreaterThan(0)
  expect(shippingFor(50_000, 1)).toBe(0)
  expect(shippingFor(100, 1)).toBeGreaterThan(0)
  expect(vatIncluded(1_000)).toBeGreaterThan(0)
  expect(allocate(0, [0])).toHaveLength(1)
  expect(findCoupon('GIBTSNICHT')).toBeUndefined()
})
