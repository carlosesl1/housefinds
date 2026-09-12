import type { WooProduct } from './types'

export function formatMoney(amount: string | number, minorUnit = 2, symbol = '£') {
  const value = typeof amount === 'string' ? Number(amount) : amount
  return `${symbol}${(value / Math.pow(10, minorUnit)).toFixed(minorUnit)}`
}

export function formatProductPrice(product: WooProduct) {
  const { prices } = product
  const range = prices.price_range

  if (range) {
    const min = formatMoney(range.min_amount, prices.currency_minor_unit, prices.currency_symbol)
    const max = formatMoney(range.max_amount, prices.currency_minor_unit, prices.currency_symbol)
    return min === max ? min : `${min} – ${max}`
  }

  return formatMoney(prices.price, prices.currency_minor_unit, prices.currency_symbol)
}
