import type { WooProduct } from '@/lib/woocommerce/types'

export type StoreCategory = {
  slug: string
  title: string
  shortTitle: string
  copy: string
  keywords: string[]
  tone: string
}

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    slug: 'smart-entry',
    title: 'Smart Entry',
    shortTitle: 'Entry',
    copy: 'Smarter door and entry solutions for a quieter, easier home.',
    keywords: ['door closer', 'door stop', 'door stopper', 'entry'],
    tone: 'bg-[#e7eee9]',
  },
  {
    slug: 'kitchen-tools',
    title: 'Kitchen Tools',
    shortTitle: 'Kitchen',
    copy: 'Clever prep tools that save time, space and unnecessary effort.',
    keywords: ['oil spray', 'oil brush', 'cutting board', 'chopping board', 'spoon scale', 'kitchen', 'cooking'],
    tone: 'bg-[#efe7db]',
  },
  {
    slug: 'space-saving',
    title: 'Space Saving',
    shortTitle: 'Organisation',
    copy: 'Useful organization ideas for making more from the space you have.',
    keywords: ['shoe storage', 'shoe rack', 'storage rack', 'toothbrush holder', 'organizer', 'organisation', 'organization'],
    tone: 'bg-[#e8e9e2]',
  },
  {
    slug: 'daily-helpers',
    title: 'Daily Helpers',
    shortTitle: 'Everyday',
    copy: 'Small practical products that make everyday routines a little easier.',
    keywords: ['motion sensor led', 'led bar light', 'mosquito', 'insect', 'bath mat', 'shoe washing', 'wash bag', 'night light'],
    tone: 'bg-[#e5ebe7]',
  },
]

function searchableProductText(product: WooProduct) {
  return `${product.name} ${product.slug} ${product.short_description || ''}`.toLowerCase()
}

export function productMatchesCategory(product: WooProduct, category: StoreCategory) {
  const haystack = searchableProductText(product)
  return category.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
}

export function getStoreCategory(slug?: string | null) {
  if (!slug) return undefined
  return STORE_CATEGORIES.find((category) => category.slug === slug)
}

export function filterProductsByStoreCategory(products: WooProduct[], slug?: string | null) {
  const category = getStoreCategory(slug)
  if (!category) return products
  return products.filter((product) => productMatchesCategory(product, category))
}

export function getCategoryProduct(products: WooProduct[], category: StoreCategory, fallbackIndex = 0) {
  return products.find((product) => productMatchesCategory(product, category)) || products[fallbackIndex % Math.max(products.length, 1)]
}
