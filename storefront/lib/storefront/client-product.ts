import type { WooImage, WooProduct, WooPrice, WooProductAttribute, WooVariationSummary } from '@/lib/woocommerce/types'
import { isOperationalAttribute, isOperationalAttributeName } from '@/lib/storefront/catalog'

export type PurchaseVariation = {
  id: number
  prices: WooPrice
  image?: StorefrontImage
  is_purchasable: boolean
  is_in_stock: boolean
  add_to_cart?: WooProduct['add_to_cart']
}
export type PurchaseProduct = {
  id: number
  name: string
  slug: string
  prices: WooPrice
  attributes: WooProductAttribute[]
  variations: WooVariationSummary[]
  is_purchasable: boolean
  is_in_stock: boolean
  add_to_cart?: WooProduct['add_to_cart']
}
export type StorefrontImage = { id: number; src: string; thumbnail: string; alt: string }
export type RecentlyViewedProductInput = { id: number; slug: string; name: string; tagline: string; price: string; image: string }

function safePrice(prices: WooPrice): WooPrice {
  return {
    price: prices.price, regular_price: prices.regular_price, sale_price: prices.sale_price,
    price_range: prices.price_range ? { min_amount: prices.price_range.min_amount, max_amount: prices.price_range.max_amount } : null,
    currency_code: prices.currency_code, currency_symbol: prices.currency_symbol,
    currency_minor_unit: prices.currency_minor_unit, currency_decimal_separator: prices.currency_decimal_separator,
    currency_thousand_separator: prices.currency_thousand_separator, currency_prefix: prices.currency_prefix, currency_suffix: prices.currency_suffix,
  }
}
function safeAttribute(attribute: WooProductAttribute): WooProductAttribute {
  return {
    id: attribute.id, name: attribute.name, taxonomy: attribute.taxonomy || null, has_variations: attribute.has_variations,
    terms: attribute.terms.map((term) => ({ id: term.id, name: term.name, slug: term.slug, default: Boolean(term.default) })),
  }
}
export function toStorefrontImages(images: WooImage[] = []): StorefrontImage[] {
  return images.filter((image) => Boolean(image?.src)).map((image) => ({ id: image.id, src: image.src, thumbnail: image.thumbnail || image.src, alt: image.alt || '' }))
}
export function toPurchaseProduct(product: WooProduct): PurchaseProduct {
  // One fixed imported label contradicts this model's description. Omit it from BOTH
  // public selectors and public variation matching. Cart still sends the exact variation
  // ID; the server reconstructs all original Woo/DSers attributes unchanged.
  const conflictingConstant = product.id === 333
    ? product.attributes.find((attribute) => /load\s*bearing/i.test(attribute.name) && attribute.terms.length === 1)?.name
    : undefined
  const excludedName = (name: string) => isOperationalAttributeName(name) || name === conflictingConstant
  return {
    id: product.id, name: product.name, slug: product.slug, prices: safePrice(product.prices),
    attributes: product.attributes.filter((attribute) => !isOperationalAttribute(attribute) && !excludedName(attribute.name)).map(safeAttribute),
    variations: (product.variations || []).map((variation) => ({ id: variation.id, attributes: variation.attributes.filter((attribute) => !excludedName(attribute.name)).map((attribute) => ({ name: attribute.name, value: attribute.value })) })),
    is_purchasable: product.is_purchasable, is_in_stock: product.is_in_stock,
    add_to_cart: product.add_to_cart ? { minimum: product.add_to_cart.minimum, maximum: product.add_to_cart.maximum, multiple_of: product.add_to_cart.multiple_of } : undefined,
  }
}
export function toPurchaseVariations(variations: WooProduct[]): PurchaseVariation[] {
  // When every variant reuses one generic photo, do not label it as a colour-specific
  // image. Real, differentiated variant images continue to drive the gallery.
  const hasDistinctImages = new Set(variations.map((variation) => variation.images?.[0]?.src).filter(Boolean)).size > 1
  return variations.map((variation) => ({
    id: variation.id, prices: safePrice(variation.prices),
    image: hasDistinctImages && variation.images?.[0] ? toStorefrontImages([variation.images[0]])[0] : undefined,
    is_purchasable: variation.is_purchasable, is_in_stock: variation.is_in_stock,
    add_to_cart: variation.add_to_cart ? { minimum: variation.add_to_cart.minimum, maximum: variation.add_to_cart.maximum, multiple_of: variation.add_to_cart.multiple_of } : undefined,
  }))
}
