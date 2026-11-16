import { z } from 'zod'
import type { components } from './schema'

export type Pet = components['schemas']['Pet']
export type Order = components['schemas']['Order']

const petSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  category: z.object({ id: z.number().int(), name: z.string() }),
  photoUrls: z.array(z.string()),
  tags: z.array(z.object({ id: z.number().int(), name: z.string() })),
  status: z.enum(['available', 'pending', 'sold']),
  priceCents: z.number().int().nonnegative(),
}) satisfies z.ZodType<Pet>

const orderSchema = z.object({
  id: z.number().int(),
  petId: z.number().int(),
  quantity: z.number().int(),
  shipDate: z.string(),
  status: z.enum(['placed', 'approved', 'delivered']),
  complete: z.boolean(),
  priceCents: z.number().int().nonnegative(),
}) satisfies z.ZodType<Order>

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API-Fehler ${status}`)
  }
}

export interface PetApi {
  findAvailablePets(): Promise<Pet[]>
  placeOrder(petId: number, priceCents: number): Promise<Order>
  cancelOrder(orderId: number): Promise<void>
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>

export function createPetApi(fetchFn: Fetch = (input, init) => fetch(input, init), baseUrl = '/api/v3'): PetApi {
  const request = async (path: string, init?: RequestInit) => {
    const response = await fetchFn(`${baseUrl}${path}`, init)
    if (!response.ok) throw new ApiError(response.status)
    return response
  }

  return {
    async findAvailablePets() {
      const response = await request('/pet/findByStatus?status=available')
      return z.array(petSchema).parse(await response.json())
    },
    async placeOrder(petId, priceCents) {
      const response = await request('/store/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ petId, priceCents }),
      })
      return orderSchema.parse(await response.json())
    },
    async cancelOrder(orderId) {
      await request(`/store/order/${orderId}`, { method: 'DELETE' })
    },
  }
}
