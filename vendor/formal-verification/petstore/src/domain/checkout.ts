import type { Order, Pet, PetApi } from '../api/client.ts'
import { ApiError } from '../api/client.ts'
import { priceCart, type Coupon, type Quote } from './pricing.ts'

export type CheckoutResult =
  | { kind: 'confirmed'; quote: Quote; orders: Order[] }
  | { kind: 'conflict'; petId: number; rolledBack: number[]; stuckOrders: number[] }
  | { kind: 'failed'; petId: number; rolledBack: number[]; stuckOrders: number[] }

/**
 * Die Petstore-API kennt nur Bestellungen für ein einzelnes Tier. Ein Warenkorb
 * ist deshalb eine Saga: Reservieren nacheinander, und schlägt ein Schritt fehl,
 * werden alle bisherigen Reservierungen wieder storniert.
 *
 * Das Protokoll ist in verification/tla/Reservation.tla modelliert.
 */
export async function checkout(api: PetApi, pets: readonly Pet[], coupon?: Coupon): Promise<CheckoutResult> {
  const quote = priceCart(
    pets.map((pet) => pet.priceCents),
    coupon,
  )
  const orders: Order[] = []

  for (const [i, pet] of pets.entries()) {
    try {
      orders.push(await api.placeOrder(pet.id, quote.lineTotalsCents[i]!))
    } catch (error) {
      const { rolledBack, stuckOrders } = await compensate(api, orders)
      const conflict = error instanceof ApiError && error.status === 409
      return { kind: conflict ? 'conflict' : 'failed', petId: pet.id, rolledBack, stuckOrders }
    }
  }
  return { kind: 'confirmed', quote, orders }
}

async function compensate(api: PetApi, orders: readonly Order[]) {
  const rolledBack: number[] = []
  const stuckOrders: number[] = []
  for (const order of orders) {
    try {
      await api.cancelOrder(order.id)
      rolledBack.push(order.petId)
    } catch {
      stuckOrders.push(order.id)
    }
  }
  return { rolledBack, stuckOrders }
}
