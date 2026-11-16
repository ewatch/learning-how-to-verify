import { createPetApi } from '../src/api/client.ts'
import { createApp } from '../server/app.ts'
import { seedPets } from '../server/seed.ts'
import { createStore } from '../server/store.ts'

/** Echter Client gegen echten Server, nur ohne Netzwerk dazwischen. */
export function createTestApi(pets = seedPets()) {
  const store = createStore(pets)
  const app = createApp(store)
  const api = createPetApi(async (input, init) => app.request(input, init))
  return { api, store, app }
}
