import { FREE_SHIPPING_FROM_CENTS, type Coupon, priceCart, SHIPPING_CENTS } from '../../src/domain/pricing.ts'
import { legacyTotalEuro } from './legacy-pricing.ts'

export type Divergence = 'gleich' | 'rundung' | 'mindestbestellwert' | 'versandschwelle' | 'unbekannt'

/**
 * Ordnet den Unterschied zwischen alter und neuer Rechnung einer bekannten
 * Ursache zu. Alles, was hier als `unbekannt` endet, ist eine Regression.
 */
export function compare(cart: number[], coupon: Extract<Coupon, { kind: 'percent' }>) {
  const quote = priceCart(cart, coupon)
  const legacyCents = Math.round(legacyTotalEuro(cart.map((cents) => cents / 100), coupon.percent) * 100)
  const gap = legacyCents - quote.totalCents
  const exactDiscounted = (quote.subtotalCents * (100 - coupon.percent)) / 100

  const classify = (): Divergence => {
    if (gap === 0) return 'gleich'
    if (quote.couponRejected) return 'mindestbestellwert'
    if (Math.abs(gap) === 1) return 'rundung'
    const straddlesThreshold =
      exactDiscounted < FREE_SHIPPING_FROM_CENTS && quote.totalCents - quote.shippingCents >= FREE_SHIPPING_FROM_CENTS
    return straddlesThreshold && Math.abs(gap - SHIPPING_CENTS) <= 1 ? 'versandschwelle' : 'unbekannt'
  }
  return { gap, legacyCents, newCents: quote.totalCents, kind: classify() }
}
