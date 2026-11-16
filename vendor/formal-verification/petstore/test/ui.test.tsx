// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../server/app.ts'
import { createStore, type Store } from '../server/store.ts'
import { App } from '../src/ui/App.tsx'

let store: Store

beforeEach(() => {
  store = createStore()
  const app = createApp(store)
  vi.stubGlobal('fetch', async (input: string, init?: RequestInit) => app.request(input, init))
  window.location.hash = ''
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const openCart = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('tab', { name: /Warenkorb/ }))

const addToCart = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  const card = (await screen.findByRole('heading', { name })).closest('.MuiCard-root') as HTMLElement
  await user.click(within(card).getByRole('button', { name: 'In den Warenkorb' }))
}

describe('Pet Store', () => {
  it('filtert den Katalog mit der Suchsprache und zeigt Syntaxfehler', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Bello' })

    await user.click(screen.getByLabelText('Suche'))
    await user.paste('category:katzen')
    expect(screen.queryByRole('heading', { name: 'Bello' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Luna' })).toBeTruthy()

    await user.paste(' farbe:rot')
    expect(screen.getByText('Unbekanntes Feld: farbe')).toBeTruthy()
  })

  it('übersteht einen geteilten Link mit kaputtem Prozent-Code', async () => {
    window.location.hash = '#q=%22100%25%22'
    render(<App />)
    expect(await screen.findByText('Keine Tiere gefunden.')).toBeTruthy()
  })

  it('bestellt mit Gutschein und zeigt den Preis', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addToCart(user, 'Kiki')
    await addToCart(user, 'Hansi')
    await openCart(user)

    await user.type(screen.getByLabelText('Gutschein'), 'tier10')
    await user.click(screen.getByRole('button', { name: 'Kostenpflichtig bestellen' }))

    expect(await screen.findByText(/Bestellt: 2 Tier\(e\) für 52,98/)).toBeTruthy()
    expect(store.orders().reduce((sum, order) => sum + order.priceCents, 0)).toBe(5_298)
  })

  it('rollt zurück, wenn ein zweiter Käufer schneller ist', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addToCart(user, 'Kiki')
    await addToCart(user, 'Hansi')
    await openCart(user)

    await user.click(screen.getByRole('switch', { name: 'Zweiten Käufer simulieren' }))
    await user.click(screen.getByRole('button', { name: 'Kostenpflichtig bestellen' }))

    expect(await screen.findByText(/Hansi wurde gerade von jemand anderem reserviert.*Zurückgerollt: Kiki/)).toBeTruthy()
    await waitFor(() => expect(store.pet(5)!.status).toBe('available'))
    expect(store.pet(6)!.status).toBe('pending')
  })

  it('blockiert nicht, wenn das Tier schon vor dem simulierten Käufer weg ist', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addToCart(user, 'Dory')
    store.placeOrder(8, 1)
    await openCart(user)

    await user.click(screen.getByRole('switch', { name: 'Zweiten Käufer simulieren' }))
    await user.click(screen.getByRole('button', { name: 'Kostenpflichtig bestellen' }))

    expect(await screen.findByText(/Dory wurde gerade von jemand anderem reserviert/)).toBeTruthy()
  })

  it('zeigt die Praktiken mit ihren Befehlen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Qualität' }))
    expect(screen.getByText('npm run verify:tla')).toBeTruthy()
  })
})
