import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'
import { STORE_CATEGORIES } from '@/lib/storefront/categories'

const synonymGroups = [
  ['door', 'entry', 'closer', 'stopper', 'closing'],
  ['kitchen', 'cooking', 'prep', 'oil', 'cutting', 'scale'],
  ['storage', 'organise', 'organize', 'organisation', 'organization', 'rack', 'tidy'],
  ['shoe', 'shoes', 'sneaker', 'sneakers', 'footwear'],
  ['light', 'lighting', 'led', 'closet', 'wardrobe', 'night', 'cupboard'],
  ['bathroom', 'bath', 'shower', 'toothbrush', 'mat'],
  ['mosquito', 'insect', 'bug', 'pest', 'fly'],
]

const intentAliases: Array<[RegExp, string]> = [
  [/door closer|automatic sensor door|pull cord door/i, 'door closes itself automatic closing stop door slamming self closing internal door entry'],
  [/oil spray|oil brush/i, 'cooking oil spray mist pan air fryer grilling roast kitchen portion control'],
  [/cutting board|chopping board/i, 'kitchen prep chop chopping vegetables fruit meat food preparation board'],
  [/shoe washing|wash bag/i, 'wash shoes washing machine footwear sneaker laundry protect shoes'],
  [/toothbrush holder/i, 'bathroom toothbrush storage organiser organizer covered holder wall counter tidy'],
  [/shoe storage|shoe rack|x-type/i, 'shoe storage rack hallway entryway bedroom small space vertical footwear organise organize tidy'],
  [/spoon scale|digital spoon/i, 'weigh ingredients coffee baking powder kitchen scale measuring spoon'],
  [/bath mat|floor mat/i, 'bathroom shower floor mat absorbent grip soft wet floor'],
  [/mosquito racket|insect killer/i, 'mosquito insect bug fly pest electric racket indoor outdoor'],
  [/motion sensor led|led bar light|induction night light/i, 'motion sensor light led wardrobe closet cupboard dark corner rechargeable night light kitchen'],
  [/homefish|aurora projector|ocean wave/i, 'ambient light projector rgb bedroom mood lighting aurora ocean wave night atmosphere'],
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9£]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function rawTokens(query: string) {
  return normalize(query).split(' ').filter((token) => token.length > 1)
}

function expandedTokens(query: string) {
  const raw = rawTokens(query)
  const expanded = new Set(raw)
  for (const token of raw) {
    const group = synonymGroups.find((items) => items.includes(token))
    group?.forEach((item) => expanded.add(item))
  }
  return Array.from(expanded)
}

function aliasesFor(product: WooProduct) {
  const source = `${product.name} ${displayProductName(product.name)}`
  return intentAliases
    .filter(([pattern]) => pattern.test(source))
    .map(([, aliases]) => aliases)
    .join(' ')
}

function categoryText(product: WooProduct) {
  const source = normalize(`${product.name} ${product.slug}`)
  return STORE_CATEGORIES
    .filter((category) => category.keywords.some((keyword) => source.includes(normalize(keyword))))
    .flatMap((category) => [category.title, category.shortTitle, ...category.keywords])
    .join(' ')
}

function strongProductText(product: WooProduct) {
  return normalize([
    displayProductName(product.name),
    displayProductTagline(product),
    aliasesFor(product),
    categoryText(product),
  ].join(' '))
}

function weakProductText(product: WooProduct) {
  // Supplier copy is intentionally a weak signal only. It can contain long SEO
  // keyword lists that make unrelated products appear relevant to a query.
  return normalize([
    product.name,
    product.slug,
    product.short_description || '',
  ].join(' '))
}

export function searchStoreProducts(products: WooProduct[], query: string) {
  const q = normalize(query)
  if (!q) return products

  const raw = rawTokens(q)
  const expanded = expandedTokens(q)

  const ranked = products.map((product) => {
    const name = normalize(displayProductName(product.name))
    const tagline = normalize(displayProductTagline(product))
    const aliases = normalize(aliasesFor(product))
    const categories = normalize(categoryText(product))
    const strong = strongProductText(product)
    const weak = weakProductText(product)

    const rawStrongMatches = raw.filter((token) => strong.includes(token)).length
    const rawNameMatches = raw.filter((token) => name.includes(token)).length
    const allRawStrong = raw.length > 0 && rawStrongMatches === raw.length

    let score = 0
    if (name === q) score += 150
    if (name.includes(q)) score += 80
    if (aliases.includes(q)) score += 65
    if (tagline.includes(q)) score += 45
    if (categories.includes(q)) score += 25
    if (allRawStrong) score += 35

    for (const token of raw) {
      if (name.includes(token)) score += 22
      else if (aliases.includes(token)) score += 16
      else if (tagline.includes(token)) score += 10
      else if (categories.includes(token)) score += 7
    }

    for (const token of expanded) {
      if (raw.includes(token)) continue
      if (name.includes(token)) score += 5
      else if (aliases.includes(token)) score += 4
      else if (tagline.includes(token)) score += 2
    }

    // Supplier wording can rescue a very specific query, but never by itself for
    // ordinary multi-word searches. This prevents SEO-heavy titles from polluting
    // results such as “door closer”.
    const weakPhraseMatch = weak.includes(q)
    if (weakPhraseMatch) score += 5

    const eligible =
      name.includes(q) ||
      aliases.includes(q) ||
      tagline.includes(q) ||
      rawStrongMatches > 0 ||
      (raw.length === 1 && weakPhraseMatch)

    return { product, score, eligible, rawNameMatches, rawStrongMatches }
  })

  return ranked
    .filter((entry) => entry.eligible && entry.score >= 8)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.rawNameMatches !== a.rawNameMatches) return b.rawNameMatches - a.rawNameMatches
      return b.rawStrongMatches - a.rawStrongMatches
    })
    .map((entry) => entry.product)
}
