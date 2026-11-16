import { matches, parseSearch, printSearch } from '../src/domain/search.ts'

const pet = {
  name: 'Luna',
  category: { name: 'Katzen' },
  tags: [{ name: 'ruhig' }],
  status: 'available',
  priceCents: 8_999,
}

/** Beliebige Bytes als Suche: Es darf nichts werfen, und Drucken muss die Bedeutung erhalten. */
export function fuzz(data: Buffer) {
  const parsed = parseSearch(data.toString('utf8'))
  if (!parsed.ok) return

  const reparsed = parseSearch(printSearch(parsed.query))
  if (!reparsed.ok) {
    if (reparsed.error === 'Suchanfrage ist zu lang' || reparsed.error === 'Ausdruck zu tief verschachtelt') return
    throw new Error(`Druckausgabe nicht lesbar: ${reparsed.error}`)
  }
  if (matches(parsed.query, pet) !== matches(reparsed.query, pet)) {
    throw new Error('Drucken hat die Bedeutung verändert')
  }
}
