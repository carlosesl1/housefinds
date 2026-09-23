import type { WooProduct } from '@/lib/woocommerce/types'
import { filterProductsByStoreCategory } from '@/lib/storefront/categories'

export type HomePromotion = {
  id: 'kitchen' | 'storage' | 'under-20' | 'edit'
  eyebrow: string
  title: string
  description: string
  action: string
  href: string
  products: WooProduct[]
}

/** A price promise must hold for every listed variant, not just the cheapest. */
export function isUnderTwentyProduct(product: WooProduct): boolean {
  if (!product.is_purchasable || !product.is_in_stock || product.prices.currency_code !== 'GBP') return false
  const { prices } = product
  const unit = prices.currency_minor_unit
  if (!Number.isInteger(unit) || unit < 0 || unit > 4) return false
  const divisor = 10 ** unit
  const rawMin = prices.price_range?.min_amount ?? prices.price
  const rawMax = prices.price_range?.max_amount ?? prices.price
  if (!String(rawMin ?? '').trim() || !String(rawMax ?? '').trim()) return false
  const min = Number(rawMin) / divisor
  const max = Number(rawMax) / divisor
  return Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min && max < 20
}

export function getHomePromotions(products: WooProduct[], placement: 'discovery' | 'curated'): HomePromotion[] {
  const available = products.filter((p) => p.is_purchasable && p.is_in_stock && p.images?.some((image) => image.src))
  const kitchen = filterProductsByStoreCategory(available, 'kitchen-tools').slice(0, 2)
  const storage = filterProductsByStoreCategory(available, 'space-saving').slice(0, 2)
  const underTwenty = available.filter(isUnderTwentyProduct).slice(0, 2)
  const daily = filterProductsByStoreCategory(available, 'daily-helpers')
  const edit = [...daily, ...available.filter((p) => !daily.some((d) => d.id === p.id))].slice(0, 2)
  const banners: HomePromotion[] = placement === 'discovery' ? [
    {
      id: 'kitchen', eyebrow: 'The kitchen edit', title: 'Kitchen tools that earn their space.',
      description: 'Practical prep finds for easier everyday cooking.', action: 'Explore kitchen',
      href: '/shop?category=kitchen-tools', products: kitchen,
    },
    {
      id: 'storage', eyebrow: 'Room for the everyday', title: 'Small-space solutions.',
      description: 'Practical storage and organisation for calmer everyday rooms.', action: 'Explore storage',
      href: '/shop?category=space-saving', products: storage,
    },
  ] : [
    {
      id: 'under-20', eyebrow: 'Small upgrades, thoughtful prices', title: 'Useful finds under £20.',
      description: 'Everyday home upgrades, all below £20.', action: 'Shop the edit',
      href: '/collections/under-20', products: underTwenty,
    },
    {
      id: 'edit', eyebrow: 'Chosen for everyday usefulness', title: 'The Housefinds edit.',
      description: 'Practical little finds for the way you live.', action: 'Browse the collection',
      href: '/shop', products: edit,
    },
  ]
  return banners.filter((banner) => banner.products.length > 0)
}
