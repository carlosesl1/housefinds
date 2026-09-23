import type { WooProduct } from '@/lib/woocommerce/types'
import { filterProductsByStoreCategory } from '@/lib/storefront/categories'

export type HomePromotion = {
  id: 'kitchen' | 'storage' | 'under-20'
  eyebrow: string
  title: string
  emphasis: string
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
  const kitchen = filterProductsByStoreCategory(available, 'kitchen-tools').slice(0, 1)
  const storage = filterProductsByStoreCategory(available, 'space-saving').slice(0, 1)
  const underTwenty = available.filter(isUnderTwentyProduct).slice(0, 2)
  const banners: HomePromotion[] = placement === 'discovery' ? [
    {
      id: 'kitchen', eyebrow: 'Kitchen tools', title: 'Everyday prep.', emphasis: 'Made simpler.',
      description: 'Useful tools for the little jobs you do every day.', action: 'Explore kitchen',
      href: '/shop?category=kitchen-tools', products: kitchen,
    },
    {
      id: 'storage', eyebrow: 'Space saving', title: 'More room.', emphasis: 'Less clutter.',
      description: 'Small ways to make more of the space you have.', action: 'Explore storage',
      href: '/shop?category=space-saving', products: storage,
    },
  ] : [
    {
      id: 'under-20', eyebrow: 'Small upgrades, thoughtful prices', title: 'Useful finds', emphasis: 'under £20.',
      description: 'Every option in this collection is priced below £20.', action: 'Shop under £20',
      href: '/collections/under-20', products: underTwenty,
    },
  ]
  return banners.filter((banner) => banner.products.length > 0)
}
