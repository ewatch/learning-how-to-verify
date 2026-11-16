// Blinder, mutationsbasierter Fuzzer.
// Aufruf: node fuzz/review.fuzz.mjs [Läufe] [Modul]
//   node fuzz/review.fuzz.mjs 20000                        -> echter Code
//   node fuzz/review.fuzz.mjs 20000 fuzz/review-buggy.mjs  -> Kopie mit eingebautem Fehler
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const target = process.argv[3] ?? 'src/review.mjs'
const { escapeHtml, validateReview } = await import(pathToFileURL(resolve(target)).href)

const corpus = [
  '{"stars":4,"title":"Sauber","author":"Anna","description":"Gute Anzeigen"}',
  '{"stars":1,"title":"Kalt","author":"Ben","description":"Kein Wartebereich"}',
]
const tricky = ['"', '{', '}', '[', ']', ':', ',', '-1', '0', '6', '4.5', '1e3', 'null', 'true', '"__proto__"', '<script>', '\\u0000', ' ']
const pick = (items) => items[Math.floor(Math.random() * items.length)]

const mutate = (s) => {
  const i = Math.floor(Math.random() * (s.length + 1))
  switch (Math.floor(Math.random() * 3)) {
    case 0: return s.slice(0, i) + pick(tricky) + s.slice(i)
    case 1: return s.slice(0, i) + s.slice(i + 1 + Math.floor(Math.random() * 5))
    default: return s.slice(0, i) + String.fromCharCode(Math.floor(Math.random() * 256)) + s.slice(i)
  }
}

const runs = Number(process.argv[2] ?? 10000)
let parsed = 0
for (let n = 0; n < runs; n++) {
  let input = pick(corpus)
  for (let k = 0; k < 1 + Math.floor(Math.random() * 4); k++) input = mutate(input)

  let body
  try { body = JSON.parse(input) } catch { continue } // kaputtes JSON lehnt die API ohnehin ab
  parsed++
  try {
    const result = validateReview(body)
    if (result.ok) {
      const { stars, title, author, description } = result.review
      if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error(`ungültige Sterne angenommen: ${stars}`)
      for (const text of [title, author, description]) {
        if (typeof text !== 'string' || text.length === 0) throw new Error('leerer Text angenommen')
        if (/[<>]/.test(escapeHtml(text))) throw new Error('HTML nach dem Escapen')
      }
    }
  } catch (error) {
    console.error(`Fund nach ${n} Läufen: ${JSON.stringify(input)}\n${error.stack}`)
    process.exit(1)
  }
}
console.log(`${runs} Läufe, davon ${parsed} gültiges JSON, kein Fund`)
