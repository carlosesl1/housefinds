import type { WooProduct, WooProductAttribute, WooAttributeTerm } from '@/lib/woocommerce/types'
import { displayProductName } from '@/lib/woocommerce/presentation'

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function richnessScore(product: WooProduct) {
  return (
    (product.is_in_stock ? 50 : 0) +
    (product.is_purchasable ? 30 : 0) +
    Math.min(product.images?.length || 0, 20) * 2 +
    Math.min(product.variations?.length || 0, 30) +
    Math.min(product.attributes?.length || 0, 10) * 2 +
    (product.review_count || 0)
  )
}

/**
 * DSers imports can occasionally leave the same AliExpress item published more
 * than once. Keep the richest live representation in customer-facing lists
 * while leaving WooCommerce untouched for operational cleanup later.
 */
export function dedupeStoreProducts(products: WooProduct[]) {
  const slots = new Map<string, number>()
  const result: WooProduct[] = []

  for (const product of products) {
    const displayName = normalize(displayProductName(product.name))
    const sku = normalize(product.sku || '')
    const key = displayName || sku || String(product.id)
    const existingIndex = slots.get(key)

    if (existingIndex === undefined) {
      slots.set(key, result.length)
      result.push(product)
      continue
    }

    if (richnessScore(product) > richnessScore(result[existingIndex])) {
      result[existingIndex] = product
    }
  }

  return result
}

const operationalAttributePattern = /(ships?\s*from|dispatch\s*from|warehouse|warehouse\s*location|origin\s*warehouse)/i

export function isOperationalAttributeName(name: string) {
  return operationalAttributePattern.test(name)
}

export function isOperationalAttribute(attribute: WooProductAttribute) {
  return isOperationalAttributeName(attribute.name)
}

export function storefrontAttributeName(attribute: WooProductAttribute) {
  const name = attribute.name.trim()
  if (/^color$/i.test(name)) {
    const terms = attribute.terms.map((term) => term.name).join(' ')
    if (/\b(force|kg|g\s*force)\b/i.test(terms)) return 'Colour & closing force'
    return 'Colour'
  }
  if (/^ships?\s*from$/i.test(name)) return 'Dispatch option'
  if (/^size$/i.test(name)) return 'Size'
  return name
}

export function storefrontTermName(term: WooAttributeTerm) {
  const raw = term.name.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
  if (!raw) return raw

  return raw
    .split(' ')
    .map((part) => {
      if (/^\d+(ml|l|cm|mm|m|g|kg|w|v|mah)$/i.test(part)) return part.toLowerCase()
      if (/^usb$/i.test(part)) return 'USB'
      if (/^type-c$/i.test(part)) return 'Type-C'
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(' ')
}
