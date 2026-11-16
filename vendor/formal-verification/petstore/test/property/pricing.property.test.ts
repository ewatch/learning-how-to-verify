import fc from 'fast-check'
import { describe, it } from 'vitest'
import { allocate } from '../../src/domain/allocate.ts'
import { findCoupon, priceCart } from '../../src/domain/pricing.ts'

const prices = fc.array(fc.integer({ min: 0, max: 5_000_000 }), { maxLength: 30 })
const coupon = fc.constantFrom(undefined, findCoupon('TIER10'), findCoupon('WILLKOMMEN5'))
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

describe('allocate', () => {
  const allocation = prices.chain((weights) =>
    fc.record({ weights: fc.constant(weights), amount: fc.integer({ min: 0, max: sum(weights) }) }),
  )

  it('verliert und erfindet keinen Cent', () => {
    fc.assert(
      fc.property(allocation, ({ amount, weights }) => {
        const expected = sum(weights) === 0 ? 0 : amount
        return sum(allocate(amount, weights)) === expected
      }),
    )
  })

  it('gibt keiner Position mehr, als ihr Gewicht trägt', () => {
    fc.assert(
      fc.property(allocation, ({ amount, weights }) =>
        allocate(amount, weights).every((share, i) => share >= 0 && share <= weights[i]!),
      ),
    )
  })
})

describe('priceCart', () => {
  it('die Positionen ergeben exakt den Gesamtpreis', () => {
    fc.assert(
      fc.property(prices, coupon, (cart, c) => {
        const quote = priceCart(cart, c)
        return sum(quote.lineTotalsCents) === quote.totalCents
      }),
    )
  })

  it('die Reihenfolge der Tiere ändert den Gesamtpreis nicht', () => {
    fc.assert(
      fc.property(prices, coupon, (cart, c) => {
        const reversed = [...cart].reverse()
        return priceCart(cart, c).totalCents === priceCart(reversed, c).totalCents
      }),
    )
  })

  it('ein Gutschein macht die Ware nie teurer und nie negativ', () => {
    fc.assert(
      fc.property(prices, coupon, (cart, c) => {
        const quote = priceCart(cart, c)
        return quote.discountCents >= 0 && quote.discountCents <= quote.subtotalCents && quote.totalCents >= 0
      }),
    )
  })

  it('die Steuer liegt innerhalb eines halben Cents am exakten Wert', () => {
    fc.assert(
      fc.property(prices, coupon, (cart, c) => {
        const quote = priceCart(cart, c)
        return Math.abs(quote.vatCents - (quote.totalCents * 19) / 119) <= 0.5
      }),
    )
  })
})
