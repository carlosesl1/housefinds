import type { WooProduct } from '@/lib/woocommerce/types'
import { isOperationalAttribute, storefrontAttributeName } from '@/lib/storefront/catalog'

function finiteNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function quantityRuleAllowsOne(value: unknown, predicate: (number: number) => boolean) {
  if (value === undefined || value === null || value === '') return true
  const number = finiteNumber(value)
  return number !== undefined && predicate(number)
}

/** Whether Woo's quantity constraints permit adding exactly one item. */
export function quantityAllowsOne(product: Pick<WooProduct, 'add_to_cart'>) {
  const rules = product.add_to_cart
  if (!rules) return true

  if (!quantityRuleAllowsOne(rules.minimum, (number) => number <= 1)) return false
  if (!quantityRuleAllowsOne(rules.maximum, (number) => number >= 1)) return false

  if (rules.multiple_of === undefined || rules.multiple_of === null) return true
  const multiple = finiteNumber(rules.multiple_of)
  if (multiple === undefined || multiple <= 0) return false
  const quotient = 1 / multiple
  return Math.abs(quotient - Math.round(quotient)) < 1e-9
}

/** Quick add is reserved for a simple product whose default quantity is valid. */
export function isQuickAddEligible(product: Pick<WooProduct, 'type' | 'has_options' | 'variations' | 'is_purchasable' | 'is_in_stock' | 'add_to_cart'>) {
  return product.type === 'simple'
    && !product.has_options
    && !(product.variations?.length)
    && product.is_purchasable
    && product.is_in_stock
    && quantityAllowsOne(product)
}

function distinctTerms(attribute: WooProduct['attributes'][number]) {
  const terms = new Map<string, string>()
  for (const term of attribute.terms || []) {
    const name = term.name.trim()
    if (name) terms.set(name.toLocaleLowerCase(), name)
  }
  return Array.from(terms.values())
}

function optionUnit(label: string) {
  const normalized = label.trim().toLocaleLowerCase()
  // Woo can merge several choices into one attribute: its term count is combinations, not one kind of option.
  if (/[,&]|\band\b/.test(normalized)) return 'options'
  if (normalized === 'pack' || normalized === 'set') return 'pack sizes'
  if (normalized === 'colour' || normalized === 'color') return 'colours'
  if (normalized === 'size') return 'sizes'
  if (normalized === 'capacity') return 'capacities'
  if (normalized === 'material') return 'materials'
  return `${normalized} options`
}

/** Summarise only visible Woo attribute values; operational supplier fields are excluded. */
export function cardOptionSummary(product: WooProduct) {
  const summaries = (product.attributes || [])
    .filter((attribute) => attribute.has_variations && !isOperationalAttribute(attribute))
    .map((attribute) => {
      const terms = distinctTerms(attribute)
      if (terms.length < 2) return undefined
      const label = storefrontAttributeName(attribute)
      if (!label.trim()) return undefined
      return `${terms.length} ${optionUnit(label)}`
    })
    .filter((summary): summary is string => Boolean(summary))
    .slice(0, 2)

  return summaries.length ? summaries.join(' / ') : undefined
}

function priceMaximumBelowTen(product: WooProduct) {
  const prices = product.prices
  if (!prices || prices.currency_code !== 'GBP' || !Number.isInteger(prices.currency_minor_unit) || prices.currency_minor_unit < 0) return false

  const range = prices.price_range
  const minimum = finiteNumber(range?.min_amount ?? prices.price)
  const maximum = finiteNumber(range?.max_amount ?? prices.price)
  if (minimum === undefined || maximum === undefined || minimum < 0 || maximum < minimum) return false

  return maximum < 10 * Math.pow(10, prices.currency_minor_unit)
}

/** A badge is returned only when its factual condition is known from Woo data. */
export function cardBadge(product: WooProduct) {
  if (!product.is_in_stock) return 'Out of stock'
  if (cardHasOptions(product)) return undefined
  if (priceMaximumBelowTen(product)) return 'Under £10'
  return undefined
}

export function cardHasOptions(product: Pick<WooProduct, 'type' | 'has_options' | 'variations'>) {
  return product.type === 'variable' || Boolean(product.has_options) || Boolean(product.variations?.length)
}

export function cardActionLabel(product: Pick<WooProduct, 'type' | 'has_options' | 'variations' | 'is_purchasable' | 'is_in_stock'>) {
  if (!product.is_purchasable || !product.is_in_stock) return 'View product'
  return cardHasOptions(product) ? 'Choose options' : 'View product'
}

/** Keep the rating description tied to real Woo aggregates, including the review count. */
export function cardRatingLabel(product: Pick<WooProduct, 'average_rating' | 'review_count'>) {
  const rating = finiteNumber(product.average_rating)
  const count = finiteNumber(product.review_count)
  if (rating === undefined || rating <= 0 || rating > 5 || count === undefined || count <= 0 || !Number.isInteger(count)) return undefined

  const formattedRating = Number(rating.toFixed(2)).toString()
  return `Rated ${formattedRating} out of 5 from ${count} reviews`
}
