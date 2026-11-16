import type { Pet, PetStatus } from './store.ts'

const categories = {
  dog: { id: 1, name: 'Hunde' },
  cat: { id: 2, name: 'Katzen' },
  bird: { id: 3, name: 'Vögel' },
  fish: { id: 4, name: 'Fische' },
}

const pet = (
  id: number,
  name: string,
  category: Pet['category'],
  priceCents: number,
  tags: string[],
  status: PetStatus = 'available',
): Pet => ({
  id,
  name,
  category,
  photoUrls: [],
  tags: tags.map((tag, i) => ({ id: i + 1, name: tag })),
  status,
  priceCents,
})

export const seedPets = (): Pet[] => [
  pet(1, 'Bello', categories.dog, 24999, ['freundlich', 'groß']),
  pet(2, 'Rex', categories.dog, 19999, ['wachsam']),
  pet(3, 'Luna', categories.cat, 8999, ['ruhig', 'wohnung']),
  pet(4, 'Minka', categories.cat, 7999, ['verspielt', 'wohnung']),
  pet(5, 'Kiki', categories.bird, 3333, ['gesprächig']),
  pet(6, 'Hansi', categories.bird, 1999, ['ruhig', 'wohnung']),
  pet(7, 'Nemo', categories.fish, 1299, ['ruhig', 'wohnung']),
  pet(8, 'Dory', categories.fish, 1199, ['vergesslich']),
  pet(9, 'Waldi', categories.dog, 15000, ['verspielt'], 'sold'),
]
