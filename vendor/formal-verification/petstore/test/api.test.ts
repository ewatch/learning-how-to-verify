import { describe, expect, it } from 'vitest'
import { ApiError } from '../src/api/client.ts'
import { createTestApi } from './helpers.ts'

const post = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

describe('Pet-Store-API', () => {
  it('liefert verfügbare Tiere, die der Client dekodieren kann', async () => {
    const { api } = createTestApi()
    const pets = await api.findAvailablePets()
    expect(pets).toHaveLength(8)
    expect(pets.every((pet) => pet.status === 'available')).toBe(true)
  })

  it('verkauft ein Tier nur einmal', async () => {
    const { api } = createTestApi()
    await api.placeOrder(1, 100)
    await expect(api.placeOrder(1, 100)).rejects.toEqual(new ApiError(409))
  })

  it('legt Bestellungen als offen an und liefert sie wieder aus', async () => {
    const { api, app } = createTestApi()
    const order = await api.placeOrder(1, 100)
    expect(order).toMatchObject({ petId: 1, quantity: 1, status: 'placed', complete: false, priceCents: 100 })
    expect(await (await app.request(`/api/v3/store/order/${order.id}`)).json()).toEqual(order)
  })

  it('gibt das Tier beim Stornieren frei', async () => {
    const { api, store } = createTestApi()
    const order = await api.placeOrder(1, 100)
    await api.cancelOrder(order.id)
    expect(store.pet(1)!.status).toBe('available')
    await expect(api.cancelOrder(order.id)).rejects.toEqual(new ApiError(404))
  })

  it('antwortet mit den dokumentierten Fehlercodes', async () => {
    const { app } = createTestApi()
    const status = async (path: string, init?: RequestInit) => (await app.request(`/api/v3${path}`, init)).status

    expect(await status('/pet/findByStatus?status=weg')).toBe(400)
    expect(await status('/pet/abc')).toBe(400)
    expect(await status('/pet/999')).toBe(404)
    expect(await status('/pet/1')).toBe(200)
    expect(await status('/store/order/abc')).toBe(400)
    expect(await status('/store/order/999')).toBe(404)
    expect(await status('/store/order/999', { method: 'DELETE' })).toBe(404)
    expect(await status('/store/order', post({ petId: 999, priceCents: 1 }))).toBe(404)
    expect(await status('/store/order', post({ petId: 1 }))).toBe(400)
    expect(await status('/store/order', { method: 'POST', body: 'kein json' })).toBe(400)
  })

  it('zählt den Bestand je Status', async () => {
    const { app } = createTestApi()
    const response = await app.request('/api/v3/store/inventory')
    expect(await response.json()).toEqual({ available: 8, pending: 0, sold: 1 })
  })
})
