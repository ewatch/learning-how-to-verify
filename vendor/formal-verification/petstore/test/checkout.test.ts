import { describe, expect, it } from 'vitest'
import { ApiError, type PetApi } from '../src/api/client.ts'
import { checkout } from '../src/domain/checkout.ts'
import { findCoupon } from '../src/domain/pricing.ts'
import { createTestApi } from './helpers.ts'

describe('checkout', () => {
  it('bestellt alle Tiere und überträgt die anteiligen Preise', async () => {
    const { api, store } = createTestApi()
    const result = await checkout(api, [store.pet(5)!, store.pet(6)!], findCoupon('TIER10'))

    expect(result.kind).toBe('confirmed')
    expect(store.orders().map((order) => [order.petId, order.priceCents])).toEqual([
      [5, 3_000 + 499],
      [6, 1_799],
    ])
    expect(store.pet(5)!.status).toBe('pending')
    expect(store.pet(6)!.status).toBe('pending')
  })

  it('rollt zurück, wenn ein späteres Tier schon vergeben ist', async () => {
    const { api, store } = createTestApi()
    store.placeOrder(6, 1)

    const result = await checkout(api, [store.pet(5)!, store.pet(7)!, store.pet(6)!])

    expect(result).toEqual({ kind: 'conflict', petId: 6, rolledBack: [5, 7], stuckOrders: [] })
    expect(store.pet(5)!.status).toBe('available')
    expect(store.pet(7)!.status).toBe('available')
    expect(store.pet(6)!.status).toBe('pending')
  })

  it('meldet andere Fehler und rollt ebenfalls zurück', async () => {
    const { api, store } = createTestApi()
    const flaky: PetApi = {
      ...api,
      placeOrder: async (petId, price) => {
        if (petId === 6) throw new ApiError(500)
        return api.placeOrder(petId, price)
      },
    }

    const result = await checkout(flaky, [store.pet(5)!, store.pet(6)!])

    expect(result).toEqual({ kind: 'failed', petId: 6, rolledBack: [5], stuckOrders: [] })
    expect(store.pet(5)!.status).toBe('available')
  })

  it('meldet Reservierungen, die sich nicht stornieren lassen', async () => {
    const { api, store } = createTestApi()
    const flaky: PetApi = {
      ...api,
      placeOrder: async (petId, price) => {
        if (petId === 6) throw new ApiError(409)
        return api.placeOrder(petId, price)
      },
      cancelOrder: async () => {
        throw new ApiError(503)
      },
    }

    const result = await checkout(flaky, [store.pet(5)!, store.pet(6)!])

    expect(result).toEqual({ kind: 'conflict', petId: 6, rolledBack: [], stuckOrders: [1] })
  })
})
