import fc from 'fast-check'
import type { PetApi } from '../src/api/client.ts'
import { checkout } from '../src/domain/checkout.ts'
import { createTestApi } from './helpers.ts'

/** Baut jeden API-Aufruf in den Scheduler ein, der dann die Reihenfolge bestimmt. */
const scheduled = (api: PetApi, s: fc.Scheduler): PetApi => ({
  findAvailablePets: s.scheduleFunction(api.findAvailablePets),
  placeOrder: s.scheduleFunction(api.placeOrder),
  cancelOrder: s.scheduleFunction(api.cancelOrder),
})

const baskets = fc.array(fc.subarray([1, 2, 3, 4]), { minLength: 2, maxLength: 3 })

/**
 * Dieselben Invarianten wie in Reservation.tla, aber gegen den echten Code:
 * Der Scheduler verschränkt die API-Aufrufe echter `checkout`-Läufe.
 */
export const raceProperty = fc.asyncProperty(fc.scheduler(), baskets, async (s, carts) => {
  const { api, store } = createTestApi()
  const race = scheduled(api, s)
  const running = Promise.all(carts.map((ids) => checkout(race, ids.map((id) => store.pet(id)!))))
  await s.waitAll()
  const results = await running

  const confirmed = results.flatMap((r) => (r.kind === 'confirmed' ? r.orders : []))
  const orderedPets = store.orders().map((order) => order.petId)

  if (new Set(orderedPets).size !== orderedPets.length) throw new Error(`Doppelt verkauft: ${orderedPets}`)
  if (orderedPets.length !== confirmed.length) {
    throw new Error(`Reservierung blieb liegen: ${orderedPets.length} Bestellungen, ${confirmed.length} bestätigt`)
  }
})
