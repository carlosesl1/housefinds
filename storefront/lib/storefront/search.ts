import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'
import { STORE_CATEGORIES } from '@/lib/storefront/categories'

const synonymGroups = [
  ['door', 'entry', 'closer', 'stopper'],
  ['kitchen', 'cooking', 'prep', 'oil', 'cutting', 'scale'],
  ['storage', 'organise', 'organize', 'organisation', 'organization', 'rack'],
  ['shoe', 'shoes', 'sneaker', 'sneakers'],
  ['light', 'lighting', 'led', 'closet', 'wardrobe', 'night'],
  ['bathroom', 'bath', 'toothbrush', 'mat'],
  ['mosquito', 'insect', 'bug', 'pest'],
]

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function expandedTokens(query: string) {
  const raw = normalize(query).split(/\s+/).filter(Boolean)
  const expanded = new Set(raw)
  for (const token of raw) {
    const group = synonymGroups.find((items) => items.includes(token))
    group?.forEach((item) => expanded.add(item))
  }
  return Array.from(expanded)
}

function productText(product: WooProduct) {
  const categoryTerms = STORE_CATEGORIES
    .filter((category) => category.keywords.some((keyword) => normalize(`${product.name} ${product.slug}`).includes(normalize(keyword))))
    .flatMap((category) => [category.title, category.shortTitle, ...category.keywords])
    .join(' ')

  return normalize([
    product.name,
    product.slug,
    displayProductName(product.name),
    displayProductTagline(product),
    product.short_description || '',
    product.description || '',
    categoryTerms,
  ].join(' '))
}

export function searchStoreProducts(products: WooProduct[], query: string) {
  const q = normalize(query.trim())
  if (!q) return products
  const tokens = expandedTokens(q)

  return products
    .map((product) => {
      const text = productText(product)
      const name = normalize(displayProductName(product.name))
      let score = 0
      if (name === q) score += 100
      if (name.includes(q)) score += 35
      if (text.includes(q)) score += 20
      for (const token of tokens) {
        if (name.includes(token)) score += 8
        else if (text.includes(token)) score += 3
      }
      return { product, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product)
}
