import fc from 'fast-check'

/** Reiner Zufall trifft die Stellen nie, an denen sich die Rechnungen trennen. */
export const carts = fc.oneof(
  fc.array(fc.integer({ min: 1, max: 30_000 }), { minLength: 1, maxLength: 8 }),
  fc.integer({ min: 11_105, max: 11_115 }).map((subtotal) => [subtotal]),
  fc.integer({ min: 1, max: 2_100 }).map((subtotal) => [subtotal]),
)
