// Vergleicht die lokale API mit dem öffentlichen Swagger Petstore.
// Nur lesende Anfragen, damit nichts auf dem fremden Server landet.
import { createApp } from '../server/app.ts'

const LIVE = 'https://petstore3.swagger.io/api/v3'
const local = createApp()

const shape = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.length > 0 ? [shape(value[0])] : []
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, v]) => [key, shape(v)]),
    )
  }
  return typeof value
}

const probe = async (fetcher: () => Promise<Response>) => {
  const response = await fetcher()
  const text = await response.text()
  try {
    return { status: response.status, shape: shape(JSON.parse(text)) }
  } catch {
    return { status: response.status, shape: 'kein JSON' }
  }
}

const paths = [
  '/pet/findByStatus?status=available',
  '/pet/findByStatus?status=weg',
  '/pet/abc',
  '/pet/999999999',
  '/store/order/abc',
  '/store/order/999999999',
  '/store/inventory',
]

let differences = 0
for (const path of paths) {
  const [ours, theirs] = await Promise.all([
    probe(async () => local.request(`/api/v3${path}`)),
    probe(() => fetch(`${LIVE}${path}`, { headers: { accept: 'application/json' } })),
  ])
  const sameStatus = ours.status === theirs.status
  const sameShape = JSON.stringify(ours.shape) === JSON.stringify(theirs.shape)
  if (sameStatus && sameShape) {
    console.log(`gleich   ${path} (${ours.status})`)
    continue
  }
  differences++
  console.log(`ANDERS   ${path}: lokal ${ours.status}, Original ${theirs.status}`)
  if (!sameShape) {
    console.log(`  lokal:    ${JSON.stringify(ours.shape)}`)
    console.log(`  Original: ${JSON.stringify(theirs.shape)}`)
  }
}
console.log(`\n${differences} von ${paths.length} Anfragen unterscheiden sich.`)
