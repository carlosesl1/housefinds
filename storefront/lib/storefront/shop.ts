import type { WooProduct } from '@/lib/woocommerce/types'
import { searchStoreProducts } from './search'

export const SHOP_SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'popular', label: 'Popular finds' },
  { value: 'new', label: 'Newest arrivals' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
]

export const SHOP_PRICES = [
  { value: 'under-10', label: 'Under £10' },
  { value: '10-20', label: '£10–£20' },
  { value: '20-plus', label: '£20 and over' },
]

export function shopSortQuery(sort: string) {
  if (sort === 'new') return { orderby: 'date', order: 'desc' as const }
  if (sort === 'popular') return { orderby: 'popularity', order: 'desc' as const }
  if (sort === 'price-low') return { orderby: 'price', order: 'asc' as const }
  if (sort === 'price-high') return { orderby: 'price', order: 'desc' as const }
  return { orderby: 'menu_order', order: 'asc' as const }
}

export function filterShopPrice(products: WooProduct[], filter?: string) {
  if (!filter) return products
  return products.filter(product => {
    const divisor = 10 ** product.prices.currency_minor_unit
    const range = product.prices.price_range
    const min = Number(range?.min_amount ?? product.prices.price) / divisor
    const max = Number(range?.max_amount ?? product.prices.price) / divisor
    if (!Number.isFinite(min) || !Number.isFinite(max)) return false
    if (filter === 'under-10') return min < 10
    if (filter === '10-20') return max >= 10 && min < 20
    if (filter === '20-plus') return max >= 20
    return true
  })
}

/** Search can rank recommendations; explicit WooCommerce sort order stays intact. */
export function searchShopProducts(products: WooProduct[], query: string, sort: string) {
  if (!query) return products
  const matches = searchStoreProducts(products, query)
  if (sort === 'recommended') return matches
  const ids = new Set(matches.map(product => product.id))
  return products.filter(product => ids.has(product.id))
}

export type ShopState = { category?: string; price?: string; sort?: string; q?: string; stock?: string }

export function shopHref(state: ShopState, updates: ShopState = {}) {
  const next = { ...state, ...updates }
  const params = new URLSearchParams()
  for (const key of ['category', 'price', 'sort', 'q', 'stock'] as const) {
    const value = next[key]
    if (value && !(key === 'sort' && value === 'recommended')) params.set(key, value)
  }
  return `/shop${params.size ? `?${params}` : ''}`
}
