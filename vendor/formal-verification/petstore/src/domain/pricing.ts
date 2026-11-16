import { allocate } from './allocate.ts'

export const FREE_SHIPPING_FROM_CENTS = 10_000
export const SHIPPING_CENTS = 499
export const VAT_PERCENT = 19

export type Coupon =
  | { code: string; kind: 'percent'; percent: number; minSubtotalCents: number }
  | { code: string; kind: 'fixed'; amountCents: number; minSubtotalCents: number }

const COUPONS: readonly Coupon[] = [
  { code: 'TIER10', kind: 'percent', percent: 10, minSubtotalCents: 2_000 },
  { code: 'WILLKOMMEN5', kind: 'fixed', amountCents: 500, minSubtotalCents: 0 },
]

export const findCoupon = (code: string): Coupon | undefined => {
  const normalized = code.trim().toUpperCase()
  return COUPONS.find((coupon) => coupon.code === normalized)
}

export interface Quote {
  subtotalCents: number
  discountCents: number
  shippingCents: number
  totalCents: number
  /** Im Gesamtpreis enthaltene Umsatzsteuer. */
  vatCents: number
  /** Zu zahlender Preis je Position, in Eingabereihenfolge, inklusive Versand. */
  lineTotalsCents: number[]
  /** Warum der Gutschein nicht gegriffen hat; fehlt, wenn er gegriffen hat. */
  couponRejected?: 'minimum_not_reached'
}

export function discountFor(coupon: Coupon, subtotalCents: number): number {
  if (subtotalCents < coupon.minSubtotalCents) return 0
  if (coupon.kind === 'fixed') return Math.min(coupon.amountCents, subtotalCents)
  return Math.floor((subtotalCents * coupon.percent) / 100)
}

export function shippingFor(discountedCents: number, itemCount: number): number {
  if (itemCount === 0) return 0
  return discountedCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS
}

/** Kaufmännisch gerundeter Steueranteil eines Bruttobetrags. */
export function vatIncluded(grossCents: number): number {
  const base = 100 + VAT_PERCENT
  return Math.floor((grossCents * VAT_PERCENT * 2 + base) / (2 * base))
}

export function priceCart(pricesCents: readonly number[], coupon?: Coupon): Quote {
  for (const price of pricesCents) {
    if (!Number.isSafeInteger(price) || price < 0) throw new RangeError(`Ungültiger Preis: ${price}`)
  }

  const subtotalCents = pricesCents.reduce((sum, price) => sum + price, 0)
  const discountCents = coupon ? discountFor(coupon, subtotalCents) : 0
  const discountedCents = subtotalCents - discountCents
  const shippingCents = shippingFor(discountedCents, pricesCents.length)
  const totalCents = discountedCents + shippingCents

  const shares = allocate(discountCents, pricesCents)
  const lineTotalsCents = pricesCents.map((price, i) => price - (shares[i] ?? 0))
  if (lineTotalsCents.length > 0) lineTotalsCents[0]! += shippingCents

  const quote: Quote = {
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents,
    vatCents: vatIncluded(totalCents),
    lineTotalsCents,
  }
  if (coupon && subtotalCents < coupon.minSubtotalCents) quote.couponRejected = 'minimum_not_reached'
  return quote
}
