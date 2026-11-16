import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type { PetApi } from '../../src/api/client.ts'
import { createTestApi } from '../helpers.ts'
import { raceProperty } from '../race.ts'

describe('checkout unter konkurrierenden Käufern', () => {
  it('kein Tier doppelt, keine Reservierung bleibt liegen', async () => {
    await fc.assert(raceProperty, { numRuns: 300 })
  })
})

describe('Modell des Servers', () => {
  type Model = Map<number, number> // Tier -> Bestellung
  interface Real {
    api: PetApi
    store: ReturnType<typeof createTestApi>['store']
  }

  class Place implements fc.AsyncCommand<Model, Real> {
    constructor(readonly petId: number) {}
    check = () => true
    async run(model: Model, real: Real) {
      if (model.has(this.petId)) {
        await expect(real.api.placeOrder(this.petId, 1)).rejects.toMatchObject({ status: 409 })
      } else {
        model.set(this.petId, (await real.api.placeOrder(this.petId, 1)).id)
      }
      expect(real.store.inventory().pending).toBe(model.size)
    }
    toString = () => `place(${this.petId})`
  }

  class Cancel implements fc.AsyncCommand<Model, Real> {
    constructor(readonly petId: number) {}
    check = (model: Readonly<Model>) => model.has(this.petId)
    async run(model: Model, real: Real) {
      await real.api.cancelOrder(model.get(this.petId)!)
      model.delete(this.petId)
      expect(real.store.pet(this.petId)!.status).toBe('available')
    }
    toString = () => `cancel(${this.petId})`
  }

  it('verhält sich für jede Befehlsfolge wie das Modell', async () => {
    const petId = fc.integer({ min: 1, max: 3 })
    const commands = fc.commands([petId.map((id) => new Place(id)), petId.map((id) => new Cancel(id))])
    await fc.assert(
      fc.asyncProperty(commands, async (cmds) => {
        const { api, store } = createTestApi()
        await fc.asyncModelRun(() => ({ model: new Map(), real: { api, store } }), cmds)
      }),
    )
  })
})
