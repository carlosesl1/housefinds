import type { WooProduct } from '@/lib/woocommerce/types'
import { filterProductsByStoreCategory } from '@/lib/storefront/categories'

const EDITS = [
  { slug: 'kitchen-tools', label: 'Kitchen Tools', title: 'Kitchen tools that earn their space.', scene: '/home/banners/kitchen-scene.webp' },
  { slug: 'space-saving', label: 'Space Saving', title: 'A place for everything. More room for you.', scene: '/home/banners/storage-scene.webp' },
  { slug: 'daily-helpers', label: 'Daily Helpers', title: 'Little helpers. Everyday difference.', scene: '/home/banners/budget-scene.webp' },
  { slug: 'smart-entry', label: 'Smart Entry', title: 'Make coming home a little easier.', scene: '/home/banners/storage-scene.webp' },
] as const

/** Visual edits always use their real category, never an unrelated fallback. */
export function getHomeEdits(products: WooProduct[]) {
  return EDITS.flatMap(edit => {
    const matches = filterProductsByStoreCategory(products, edit.slug)
    if (!matches.length) return []
    return [{ ...edit, href: `/shop?category=${edit.slug}`, count: matches.length, products: matches.slice(0, 2) }]
  })
}
