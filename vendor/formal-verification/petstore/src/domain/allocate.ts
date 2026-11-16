/**
 * Verteilt `amount` proportional zu `weights` auf ganze Cent (kumulatives
 * Runden). Die Summe der Anteile ist exakt `amount`, und bei
 * `amount <= Summe(weights)` liegt jeder Anteil zwischen 0 und seinem Gewicht.
 *
 * Bewiesen in verification/dafny/Allocate.dfy. Die Zwischenprodukte überschreiten
 * 2^53, deshalb rechnet die Funktion mit BigInt.
 */
export function allocate(amount: number, weights: readonly number[]): number[] {
  const total = weights.reduce((sum, w) => sum + BigInt(w), 0n)
  if (total === 0n) return weights.map(() => 0)

  const scaled = BigInt(amount)
  let cumulative = 0n
  let allocated = 0n
  return weights.map((weight) => {
    cumulative += BigInt(weight)
    const next = (scaled * cumulative) / total
    const share = next - allocated
    allocated = next
    return Number(share)
  })
}
