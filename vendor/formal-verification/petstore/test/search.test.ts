import { describe, expect, it } from 'vitest'
import { matches, MAX_DEPTH, MAX_QUERY_LENGTH, parseSearch, printSearch, type Query } from '../src/domain/search.ts'

const pet = {
  name: 'Luna',
  category: { name: 'Katzen' },
  tags: [{ name: 'ruhig' }, { name: 'wohnung' }],
  status: 'available',
  priceCents: 8_999,
}

const query = (input: string): Query => {
  const result = parseSearch(input)
  if (!result.ok) throw new Error(result.error)
  return result.query
}
const hits = (input: string) => matches(query(input), pet)
const error = (input: string) => {
  const result = parseSearch(input)
  return result.ok ? undefined : result.error
}

describe('parseSearch', () => {
  it('liest eine leere Suche als alles', () => {
    expect(query('  ')).toEqual({ t: 'all' })
  })
  it('liest Felder und Preise', () => {
    expect(query('tag:ruhig')).toEqual({ t: 'field', field: 'tag', value: 'ruhig' })
    expect(query('price<=19.9')).toEqual({ t: 'price', op: '<=', cents: 1_990 })
    expect(query('price>=5')).toEqual({ t: 'price', op: '>=', cents: 500 })
    expect(query('price>5.05')).toEqual({ t: 'price', op: '>', cents: 505 })
  })
  it('bindet UND stärker als ODER', () => {
    expect(query('a b OR c')).toEqual({
      t: 'or',
      left: { t: 'and', left: { t: 'word', value: 'a' }, right: { t: 'word', value: 'b' } },
      right: { t: 'word', value: 'c' },
    })
  })
  it('dekodiert nur Werte in Anführungszeichen', () => {
    expect(query('"a%20b"')).toEqual({ t: 'word', value: 'a b' })
    expect(query('a%20b')).toEqual({ t: 'word', value: 'a%20b' })
  })
  it('liest Wörter in Anführungszeichen nie als Feld', () => {
    expect(query('"tag" x')).toEqual({ t: 'and', left: { t: 'word', value: 'tag' }, right: { t: 'word', value: 'x' } })
    expect(error('"tag":x')).toBe('Unerwartetes Zeichen')
  })
  it('zählt nur die Verschachtelung, nicht die Länge', () => {
    const many = Array.from({ length: MAX_DEPTH * 2 }, (_, i) => `w${i}`).join(' ')
    expect(parseSearch(many).ok).toBe(true)
  })
  it('überlebt kaputte Prozent-Codes', () => {
    expect(query('"100%"')).toEqual({ t: 'word', value: '100%' })
  })
  it('nennt Syntaxfehler', () => {
    expect(error('"offen')).toBe('Anführungszeichen nicht geschlossen')
    expect(error('(a')).toBe('Klammer nicht geschlossen')
    expect(error('a)')).toBe('Unerwartetes Zeichen nach Ausdrucksende')
    expect(error('-')).toBe('Ausdruck endet unerwartet')
    expect(error('OR')).toBe('Unerwartetes Zeichen')
    expect(error('tag:')).toBe('Wert fehlt nach tag')
    expect(error('farbe:rot')).toBe('Unbekanntes Feld: farbe')
    expect(error('__proto__:x')).toBe('Unbekanntes Feld: __proto__')
    expect(error('name<3')).toBe('Vergleiche gibt es nur für price')
    expect(error('price<teuer')).toBe('Ungültiger Preis: teuer')
    expect(error('price<x5')).toBe('Ungültiger Preis: x5')
    expect(error('price<5x')).toBe('Ungültiger Preis: 5x')
  })
  it('begrenzt Länge und Tiefe', () => {
    expect(parseSearch('a'.repeat(MAX_QUERY_LENGTH)).ok).toBe(true)
    expect(error('a'.repeat(MAX_QUERY_LENGTH + 1))).toBe('Suchanfrage ist zu lang')
    expect(parseSearch('('.repeat(MAX_DEPTH - 1) + 'a' + ')'.repeat(MAX_DEPTH - 1)).ok).toBe(true)
    expect(error('('.repeat(MAX_DEPTH) + 'a' + ')'.repeat(MAX_DEPTH))).toBe('Ausdruck zu tief verschachtelt')
  })
})

describe('matches', () => {
  it('trifft bei leerer Suche alles', () => {
    expect(hits('')).toBe(true)
  })
  it('sucht freie Wörter in Name, Kategorie und Tags', () => {
    expect(hits('LUNA')).toBe(true)
    expect(hits('katzen')).toBe(true)
    expect(hits('wohn')).toBe(true)
    expect(hits('hund')).toBe(false)
  })
  it('sucht Felder gezielt', () => {
    expect(hits('name:lun')).toBe(true)
    expect(hits('name:katzen')).toBe(false)
    expect(hits('category:katz')).toBe(true)
    expect(hits('category:luna')).toBe(false)
    expect(hits('tag:ruhig')).toBe(true)
    expect(hits('tag:luna')).toBe(false)
    expect(hits('status:AVAILABLE')).toBe(true)
    expect(hits('status:avail')).toBe(false)
  })
  it('vergleicht Preise an der Grenze korrekt', () => {
    expect(hits('price<89.99')).toBe(false)
    expect(hits('price<=89.99')).toBe(true)
    expect(hits('price>89.99')).toBe(false)
    expect(hits('price>=89.99')).toBe(true)
    expect(hits('price<90')).toBe(true)
    expect(hits('price>89')).toBe(true)
    expect(hits('price<=89.98')).toBe(false)
    expect(hits('price>=90')).toBe(false)
  })
  it('kombiniert mit nicht, und, oder', () => {
    expect(hits('-hund')).toBe(true)
    expect(hits('-luna')).toBe(false)
    expect(hits('luna hund')).toBe(false)
    expect(hits('luna ruhig')).toBe(true)
    expect(hits('hund luna')).toBe(false)
    expect(hits('hund OR luna')).toBe(true)
    expect(hits('luna OR hund')).toBe(true)
    expect(hits('hund OR maus')).toBe(false)
  })
})

describe('printSearch', () => {
  it('druckt die leere Suche leer und einfache Wörter ohne Anführungszeichen', () => {
    expect(printSearch({ t: 'all' })).toBe('')
    expect(printSearch({ t: 'word', value: 'wohnung' })).toBe('wohnung')
  })
  it('setzt Werte mit Sonderzeichen in Anführungszeichen', () => {
    expect(printSearch({ t: 'word', value: 'a b' })).toBe('"a b"')
    expect(printSearch({ t: 'word', value: 'OR' })).toBe('"OR"')
    expect(printSearch({ t: 'word', value: '50%"' })).toBe('"50%25%22"')
  })
  it('klammert nur, wo es die Struktur verlangt', () => {
    expect(printSearch(query('a (b OR c)'))).toBe('a (b OR c)')
    expect(printSearch(query('(a b) OR c'))).toBe('a b OR c')
    expect(printSearch(query('-(a b)'))).toBe('-(a b)')
    expect(printSearch(query('a -b'))).toBe('a -b')
  })
  it('druckt Preise mit zwei Nachkommastellen', () => {
    expect(printSearch(query('price<5.5'))).toBe('price<5.50')
  })
})
