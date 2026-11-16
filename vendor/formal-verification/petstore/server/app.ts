import { Hono } from 'hono'
import { z } from 'zod'
import { createStore, type PetStatus } from './store.ts'

const statusSchema = z.enum(['available', 'pending', 'sold'])
const newOrderSchema = z.object({
  petId: z.number().int().positive(),
  priceCents: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
})

const parseId = (raw: string) => (/^[1-9]\d{0,14}$/.test(raw) ? Number(raw) : undefined)

export function createApp(store = createStore()) {
  const app = new Hono().basePath('/api/v3')

  app.get('/pet/findByStatus', (c) => {
    const raw = c.req.query('status') ?? 'available'
    const status = statusSchema.safeParse(raw)
    if (!status.success) return c.json({ code: 400, message: 'Invalid status value' }, 400)
    return c.json(store.pets().filter((p) => p.status === (status.data satisfies PetStatus)))
  })

  app.get('/pet/:petId', (c) => {
    const id = parseId(c.req.param('petId'))
    if (id === undefined) return c.json({ code: 400, message: 'Invalid ID supplied' }, 400)
    const pet = store.pet(id)
    return pet ? c.json(pet) : c.json({ message: 'Pet not found' }, 404)
  })

  app.get('/store/inventory', (c) => c.json(store.inventory()))

  app.post('/store/order', async (c) => {
    const body = newOrderSchema.safeParse(await c.req.json().catch(() => undefined))
    if (!body.success) return c.json({ code: 400, message: 'Invalid order' }, 400)
    const result = store.placeOrder(body.data.petId, body.data.priceCents)
    if (result.kind === 'not_found') return c.json({ message: 'Pet not found' }, 404)
    if (result.kind === 'conflict') return c.json({ message: 'Pet not available' }, 409)
    return c.json(result.order)
  })

  app.get('/store/order/:orderId', (c) => {
    const id = parseId(c.req.param('orderId'))
    if (id === undefined) return c.json({ code: 400, message: 'Invalid ID supplied' }, 400)
    const order = store.order(id)
    return order ? c.json(order) : c.json({ message: 'Order not found' }, 404)
  })

  app.delete('/store/order/:orderId', (c) => {
    const id = parseId(c.req.param('orderId'))
    if (id === undefined) return c.json({ code: 400, message: 'Invalid ID supplied' }, 400)
    return store.cancelOrder(id) ? c.json({ message: 'Order deleted' }) : c.json({ message: 'Order not found' }, 404)
  })

  return app
}
