import { seedPets } from './seed.ts'

export type PetStatus = 'available' | 'pending' | 'sold'

export interface Pet {
  id: number
  name: string
  category: { id: number; name: string }
  photoUrls: string[]
  tags: { id: number; name: string }[]
  status: PetStatus
  priceCents: number
}

export interface Order {
  id: number
  petId: number
  quantity: number
  shipDate: string
  status: 'placed' | 'approved' | 'delivered'
  complete: boolean
  priceCents: number
}

export type PlaceResult = { kind: 'ok'; order: Order } | { kind: 'not_found' } | { kind: 'conflict' }

/**
 * Die Schreiboperationen laufen synchron durch, also ohne `await` zwischen
 * Prüfen und Setzen. In Node ist das atomar, und genau diese Atomarität setzt
 * die Aktion `Reserve` in verification/tla/Reservation.tla voraus.
 */
export function createStore(pets: Pet[] = seedPets()) {
  const petsById = new Map(pets.map((p) => [p.id, p]))
  const orders = new Map<number, Order>()
  let nextOrderId = 1

  return {
    pets: () => [...petsById.values()],
    pet: (id: number) => petsById.get(id),
    orders: () => [...orders.values()],
    order: (id: number) => orders.get(id),

    placeOrder(petId: number, priceCents: number): PlaceResult {
      const target = petsById.get(petId)
      if (!target) return { kind: 'not_found' }
      if (target.status !== 'available') return { kind: 'conflict' }
      target.status = 'pending'
      const order: Order = {
        id: nextOrderId++,
        petId,
        quantity: 1,
        shipDate: new Date(0).toISOString(),
        status: 'placed',
        complete: false,
        priceCents,
      }
      orders.set(order.id, order)
      return { kind: 'ok', order }
    },

    cancelOrder(id: number): boolean {
      const order = orders.get(id)
      if (!order) return false
      orders.delete(id)
      petsById.get(order.petId)!.status = 'available'
      return true
    },

    inventory() {
      const counts: Record<PetStatus, number> = { available: 0, pending: 0, sold: 0 }
      for (const p of petsById.values()) counts[p.status]++
      return counts
    },
  }
}

export type Store = ReturnType<typeof createStore>
