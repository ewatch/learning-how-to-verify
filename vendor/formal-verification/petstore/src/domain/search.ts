/**
 * Suchsprache des Katalogs, zum Beispiel:
 *   category:katzen -tag:verspielt (price<50 OR ruhig)
 *
 * Die Eingabe stammt aus dem Suchfeld und aus geteilten Links, ist also nicht
 * vertrauenswürdig: `parseSearch` wirft nie, sondern liefert einen Fehlerwert.
 */
export type Field = 'name' | 'tag' | 'category' | 'status'
export type Comparison = '<' | '<=' | '>' | '>='

export type Query =
  | { t: 'all' }
  | { t: 'word'; value: string }
  | { t: 'field'; field: Field; value: string }
  | { t: 'price'; op: Comparison; cents: number }
  | { t: 'not'; query: Query }
  | { t: 'and'; left: Query; right: Query }
  | { t: 'or'; left: Query; right: Query }

export type ParseResult = { ok: true; query: Query } | { ok: false; error: string }

export interface Searchable {
  name: string
  category: { name: string }
  tags: { name: string }[]
  status: string
  priceCents: number
}

export const MAX_QUERY_LENGTH = 500
export const MAX_DEPTH = 32

const FIELDS: readonly string[] = ['name', 'tag', 'category', 'status']
const BARE_WORD = /^[^\s()"<>:=-][^\s()"<>:=]*$/
const PRICE = /^(\d{1,7})(?:\.(\d{1,2}))?$/

type Token =
  | { k: 'lparen' | 'rparen' | 'minus' | 'or' | 'colon' }
  | { k: 'cmp'; op: Comparison }
  | { k: 'text'; value: string; quoted: boolean }

class SyntaxProblem extends Error {}

/** Werte in Anführungszeichen dürfen prozentkodiert sein (kopierte URLs). */
function decodeQuoted(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const c = input[i]!
    if (/\s/.test(c)) {
      i++
    } else if (c === '(') {
      tokens.push({ k: 'lparen' })
      i++
    } else if (c === ')') {
      tokens.push({ k: 'rparen' })
      i++
    } else if (c === '-') {
      tokens.push({ k: 'minus' })
      i++
    } else if (c === ':') {
      tokens.push({ k: 'colon' })
      i++
    } else if (c === '<' || c === '>') {
      const op = input[i + 1] === '=' ? (`${c}=` as Comparison) : c
      tokens.push({ k: 'cmp', op })
      i += op.length
    } else if (c === '"') {
      const end = input.indexOf('"', i + 1)
      if (end === -1) throw new SyntaxProblem('Anführungszeichen nicht geschlossen')
      tokens.push({ k: 'text', value: decodeQuoted(input.slice(i + 1, end)), quoted: true })
      i = end + 1
    } else {
      let end = i
      while (end < input.length && !/[\s()"<>:]/.test(input[end]!)) end++
      const word = input.slice(i, end)
      tokens.push(word === 'OR' ? { k: 'or' } : { k: 'text', value: word, quoted: false })
      i = end
    }
  }
  return tokens
}

function parsePrice(raw: string): number {
  const match = PRICE.exec(raw)
  if (!match) throw new SyntaxProblem(`Ungültiger Preis: ${raw}`)
  return Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'))
}

class Parser {
  private position = 0
  private depth = 0

  constructor(private readonly tokens: Token[]) {}

  parseAll(): Query {
    if (this.tokens.length === 0) return { t: 'all' }
    const query = this.parseOr()
    if (this.peek()) throw new SyntaxProblem('Unerwartetes Zeichen nach Ausdrucksende')
    return query
  }

  private peek = () => this.tokens[this.position]
  private next = () => this.tokens[this.position++]

  private parseOr(): Query {
    let left = this.parseAnd()
    while (this.peek()?.k === 'or') {
      this.next()
      left = { t: 'or', left, right: this.parseAnd() }
    }
    return left
  }

  private parseAnd(): Query {
    let left = this.parseUnary()
    for (;;) {
      const token = this.peek()
      if (!token || token.k === 'or' || token.k === 'rparen') return left
      left = { t: 'and', left, right: this.parseUnary() }
    }
  }

  private parseUnary(): Query {
    if (++this.depth > MAX_DEPTH) throw new SyntaxProblem('Ausdruck zu tief verschachtelt')
    try {
      const token = this.next()
      if (!token) throw new SyntaxProblem('Ausdruck endet unerwartet')
      if (token.k === 'minus') return { t: 'not', query: this.parseUnary() }
      if (token.k === 'lparen') {
        const inner = this.parseOr()
        if (this.next()?.k !== 'rparen') throw new SyntaxProblem('Klammer nicht geschlossen')
        return inner
      }
      if (token.k === 'text') return this.parseTerm(token)
      throw new SyntaxProblem('Unerwartetes Zeichen')
    } finally {
      this.depth--
    }
  }

  private parseTerm(token: Extract<Token, { k: 'text' }>): Query {
    const following = this.peek()
    if (token.quoted || (following?.k !== 'colon' && following?.k !== 'cmp')) {
      return { t: 'word', value: token.value }
    }
    this.next()
    const value = this.next()
    if (value?.k !== 'text') throw new SyntaxProblem(`Wert fehlt nach ${token.value}`)
    if (following.k === 'cmp') {
      if (token.value !== 'price') throw new SyntaxProblem('Vergleiche gibt es nur für price')
      return { t: 'price', op: following.op, cents: parsePrice(value.value) }
    }
    if (!FIELDS.includes(token.value)) throw new SyntaxProblem(`Unbekanntes Feld: ${token.value}`)
    return { t: 'field', field: token.value as Field, value: value.value }
  }
}

export function parseSearch(input: string): ParseResult {
  if (input.length > MAX_QUERY_LENGTH) return { ok: false, error: 'Suchanfrage ist zu lang' }
  try {
    return { ok: true, query: new Parser(tokenize(input)).parseAll() }
  } catch (error) {
    if (error instanceof SyntaxProblem) return { ok: false, error: error.message }
    throw error
  }
}

const includes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.toLowerCase())

export function matches(query: Query, pet: Searchable): boolean {
  switch (query.t) {
    case 'all':
      return true
    case 'word':
      return (
        includes(pet.name, query.value) ||
        includes(pet.category.name, query.value) ||
        pet.tags.some((tag) => includes(tag.name, query.value))
      )
    case 'field':
      if (query.field === 'name') return includes(pet.name, query.value)
      if (query.field === 'category') return includes(pet.category.name, query.value)
      if (query.field === 'status') return pet.status.toLowerCase() === query.value.toLowerCase()
      return pet.tags.some((tag) => includes(tag.name, query.value))
    case 'price':
      if (query.op === '<') return pet.priceCents < query.cents
      if (query.op === '<=') return pet.priceCents <= query.cents
      if (query.op === '>') return pet.priceCents > query.cents
      return pet.priceCents >= query.cents
    case 'not':
      return !matches(query.query, pet)
    case 'and':
      return matches(query.left, pet) && matches(query.right, pet)
    case 'or':
      return matches(query.left, pet) || matches(query.right, pet)
  }
}

const quote = (value: string) => `"${value.replaceAll('%', '%25').replaceAll('"', '%22')}"`
const text = (value: string) => (BARE_WORD.test(value) && value !== 'OR' ? value : quote(value))

const formatPrice = (cents: number) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`

/** Gegenstück zu `parseSearch`: `parseSearch(printSearch(q))` ergibt wieder `q`. */
export function printSearch(query: Query): string {
  switch (query.t) {
    case 'all':
      return ''
    case 'word':
      return text(query.value)
    case 'field':
      return `${query.field}:${text(query.value)}`
    case 'price':
      return `price${query.op}${formatPrice(query.cents)}`
    case 'not': {
      const inner = printSearch(query.query)
      return query.query.t === 'and' || query.query.t === 'or' ? `-(${inner})` : `-${inner}`
    }
    case 'and': {
      const left = query.left.t === 'or' ? `(${printSearch(query.left)})` : printSearch(query.left)
      const right =
        query.right.t === 'and' || query.right.t === 'or' ? `(${printSearch(query.right)})` : printSearch(query.right)
      return `${left} ${right}`
    }
    case 'or': {
      const right = query.right.t === 'or' ? `(${printSearch(query.right)})` : printSearch(query.right)
      return `${printSearch(query.left)} OR ${right}`
    }
  }
}
