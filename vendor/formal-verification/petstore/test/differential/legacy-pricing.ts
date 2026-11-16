/**
 * Die Preisberechnung vor dem Refactoring auf ganze Cent, unverändert als
 * Vergleichsobjekt: Euro als Gleitkommazahl, gerundet wird am Ende.
 */
export function legacyTotalEuro(pricesEuro: number[], percent: number): number {
  let subtotal = 0
  for (const price of pricesEuro) subtotal += price
  const discounted = subtotal * (1 - percent / 100)
  const shipping = pricesEuro.length === 0 || discounted >= 100 ? 0 : 4.99
  return Math.round((discounted + shipping) * 100) / 100
}
