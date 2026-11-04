import type { WooProduct } from '@/lib/woocommerce/types'
import { findProductByKeywords } from '@/lib/woocommerce/presentation'

export function homeHeroProduct(products: WooProduct[]) {
  return findProductByKeywords(products, ['oil spray'])
}

export function homeKitchenProduct(products: WooProduct[]) {
  return products.find(product => /cutting board|chopping board/i.test(product.name) && product.is_in_stock && product.is_purchasable)
}

function unique(products: WooProduct[]) {
  return products.filter((product, index, all) => all.findIndex(item => item.id === product.id) === index)
}

/** Give each home section different products first; a repeat only fills a section the catalogue cannot otherwise fill. */
export function planHomeProducts(products: WooProduct[]) {
  const featuredProduct = findProductByKeywords(products, ['spoon scale']) || findProductByKeywords(products, ['motion sensor led']) || products[0]
  const placed = new Set([homeHeroProduct(products), homeKitchenProduct(products), featuredProduct].flatMap(product => product?.id ?? []))
  const leadProducts = unique([...products.filter(product => !placed.has(product.id)), ...products]).slice(0, 4)
  const lead = new Set(leadProducts.map(product => product.id))
  const budgetProducts = unique([...products.filter(product => !placed.has(product.id) && !lead.has(product.id)), ...products.filter(product => !lead.has(product.id)), ...products])
  return { featuredProduct, leadProducts, budgetProducts }
}
