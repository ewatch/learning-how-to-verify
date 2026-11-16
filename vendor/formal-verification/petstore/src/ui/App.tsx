import PetsIcon from '@mui/icons-material/Pets'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPetApi, type Pet } from '../api/client.ts'
import { checkout, type CheckoutResult } from '../domain/checkout.ts'
import { findCoupon, priceCart } from '../domain/pricing.ts'
import { matches, parseSearch } from '../domain/search.ts'
import { PRACTICES, type PracticeId } from './practices.ts'

const api = createPetApi()

const euro = (cents: number) => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

function readQueryFromUrl(): string {
  return new URLSearchParams(window.location.hash.slice(1)).get('q') ?? ''
}

function GuardedBy({ practices }: { practices: PracticeId[] }) {
  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {practices.map((id) => (
        <Tooltip key={id} title={`${PRACTICES[id].guards}. Befehl: ${PRACTICES[id].command}`}>
          <Chip size="small" variant="outlined" color="primary" label={PRACTICES[id].name} />
        </Tooltip>
      ))}
    </Stack>
  )
}

function Catalog({
  pets,
  cart,
  onAdd,
}: {
  pets: Pet[]
  cart: Pet[]
  onAdd: (pet: Pet) => void
}) {
  const [search, setSearch] = useState(readQueryFromUrl)
  const parsed = useMemo(() => parseSearch(search), [search])

  useEffect(() => {
    window.history.replaceState(null, '', `#q=${encodeURIComponent(search)}`)
  }, [search])

  const visible = parsed.ok ? pets.filter((pet) => matches(parsed.query, pet)) : pets

  return (
    <Stack spacing={2}>
      <TextField
        label="Suche"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        error={!parsed.ok}
        helperText={parsed.ok ? 'Beispiel: wohnung -category:fische price<50' : parsed.error}
        fullWidth
      />
      <GuardedBy practices={['fuzzing', 'pbt', 'mutation']} />
      <Grid container spacing={2}>
        {visible.map((pet) => (
          <Grid key={pet.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  {pet.category.name}
                </Typography>
                <Typography variant="h6">{pet.name}</Typography>
                <Typography sx={{ mb: 1 }}>{euro(pet.priceCents)}</Typography>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {pet.tags.map((tag) => (
                    <Chip key={tag.id} size="small" label={tag.name} />
                  ))}
                </Stack>
              </CardContent>
              <CardActions>
                <Button disabled={cart.some((item) => item.id === pet.id)} onClick={() => onAdd(pet)}>
                  In den Warenkorb
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {visible.length === 0 && <Alert severity="info">Keine Tiere gefunden.</Alert>}
    </Stack>
  )
}

function Amount({ label, cents, strong }: { label: string; cents: number; strong?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography sx={{ fontWeight: strong ? 700 : 400 }}>{label}</Typography>
      <Typography sx={{ fontWeight: strong ? 700 : 400 }}>{euro(cents)}</Typography>
    </Stack>
  )
}

function describeResult(result: CheckoutResult, pets: Pet[]) {
  const name = (id: number) => pets.find((pet) => pet.id === id)?.name ?? `Tier ${id}`
  if (result.kind === 'confirmed') {
    return { severity: 'success' as const, text: `Bestellt: ${result.orders.length} Tier(e) für ${euro(result.quote.totalCents)}.` }
  }
  const rollback = result.rolledBack.length
    ? ` Zurückgerollt: ${result.rolledBack.map(name).join(', ')}.`
    : ' Es musste nichts zurückgerollt werden.'
  const stuck = result.stuckOrders.length
    ? ` Nicht stornierbar: Bestellung ${result.stuckOrders.join(', ')}.`
    : ''
  const cause =
    result.kind === 'conflict' ? `${name(result.petId)} wurde gerade von jemand anderem reserviert.` : `Bestellung von ${name(result.petId)} fehlgeschlagen.`
  return { severity: 'warning' as const, text: `${cause}${rollback}${stuck}` }
}

function Cart({
  cart,
  onRemove,
  onFinished,
}: {
  cart: Pet[]
  onRemove: (pet: Pet) => void
  onFinished: (result: CheckoutResult) => void
}) {
  const [couponCode, setCouponCode] = useState('')
  const [simulateRival, setSimulateRival] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<CheckoutResult>()
  const [outcomePets, setOutcomePets] = useState<Pet[]>([])

  const coupon = findCoupon(couponCode)
  const quote = priceCart(
    cart.map((pet) => pet.priceCents),
    coupon,
  )

  const submit = async () => {
    setBusy(true)
    const last = cart.at(-1)
    // Ist das Tier schon weg, scheitert der simulierte Käufer; den Konflikt meldet dann checkout.
    if (simulateRival && last) await api.placeOrder(last.id, last.priceCents).catch(() => undefined)
    const next = await checkout(api, cart, coupon)
    setOutcomePets(cart)
    setResult(next)
    setBusy(false)
    onFinished(next)
  }

  const outcome = result && describeResult(result, outcomePets)

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        {outcome && (
          <Alert severity={outcome.severity} sx={{ mb: 2 }}>
            {outcome.text}
          </Alert>
        )}
        {cart.length === 0 ? (
          <Alert severity="info">Der Warenkorb ist leer.</Alert>
        ) : (
          <List disablePadding>
            {cart.map((pet, i) => (
              <ListItem
                key={pet.id}
                divider
                secondaryAction={<Button onClick={() => onRemove(pet)}>Entfernen</Button>}
              >
                <ListItemText
                  primary={pet.name}
                  secondary={`Listenpreis ${euro(pet.priceCents)}, zu zahlen ${euro(quote.lineTotalsCents[i]!)}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <TextField
                label="Gutschein"
                size="small"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                error={couponCode !== '' && !coupon}
                helperText={
                  couponCode !== '' && !coupon
                    ? 'Unbekannter Gutschein'
                    : quote.couponRejected
                      ? 'Mindestbestellwert nicht erreicht'
                      : 'Zum Beispiel TIER10 oder WILLKOMMEN5'
                }
              />
              <Amount label="Zwischensumme" cents={quote.subtotalCents} />
              <Amount label="Rabatt" cents={-quote.discountCents} />
              <Amount label="Versand" cents={quote.shippingCents} />
              <Divider />
              <Amount label="Gesamt" cents={quote.totalCents} strong />
              <Typography variant="body2" color="text.secondary">
                Enthält {euro(quote.vatCents)} Umsatzsteuer
              </Typography>
              <GuardedBy practices={['proof', 'pbt', 'differential', 'mutation']} />
              <Divider />
              <FormControlLabel
                control={<Switch checked={simulateRival} onChange={(_, checked) => setSimulateRival(checked)} />}
                label="Zweiten Käufer simulieren"
              />
              <Button
                variant="contained"
                disabled={cart.length === 0 || busy}
                onClick={() => void submit()}
                startIcon={busy ? <CircularProgress size={16} /> : undefined}
              >
                Kostenpflichtig bestellen
              </Button>
              <GuardedBy practices={['model', 'pbt']} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

function Quality() {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Praktik</TableCell>
            <TableCell>Sichert</TableCell>
            <TableCell>Findet im Showcase</TableCell>
            <TableCell>Befehl</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(PRACTICES).map(([id, practice]) => (
            <TableRow key={id}>
              <TableCell>{practice.name}</TableCell>
              <TableCell>{practice.guards}</TableCell>
              <TableCell>{practice.finds}</TableCell>
              <TableCell>
                <code>{practice.command}</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function App() {
  const [tab, setTab] = useState(0)
  const [pets, setPets] = useState<Pet[]>()
  const [loadError, setLoadError] = useState(false)
  const [cart, setCart] = useState<Pet[]>([])

  const reload = useCallback(async () => {
    try {
      setPets(await api.findAvailablePets())
      setLoadError(false)
    } catch {
      setLoadError(true)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const onFinished = (result: CheckoutResult) => {
    if (result.kind === 'confirmed') setCart([])
    else setCart((items) => items.filter((pet) => pet.id !== result.petId))
    void reload()
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <PetsIcon />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Pet Store
          </Typography>
          <Badge badgeContent={cart.length} color="secondary">
            <ShoppingCartIcon aria-label="Warenkorb" />
          </Badge>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ mb: 3 }}>
          <Tab label="Katalog" />
          <Tab label={`Warenkorb (${cart.length})`} />
          <Tab label="Qualität" />
        </Tabs>
        {loadError && <Alert severity="error">Die API ist nicht erreichbar. Läuft npm run dev?</Alert>}
        <Box hidden={tab !== 0}>
          {pets ? (
            <Catalog pets={pets} cart={cart} onAdd={(pet) => setCart((items) => [...items, pet])} />
          ) : (
            !loadError && <CircularProgress />
          )}
        </Box>
        <Box hidden={tab !== 1}>
          <Cart
            cart={cart}
            onRemove={(pet) => setCart((items) => items.filter((item) => item.id !== pet.id))}
            onFinished={onFinished}
          />
        </Box>
        <Box hidden={tab !== 2}>
          <Quality />
        </Box>
      </Container>
    </>
  )
}
