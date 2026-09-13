export type WooImage = {
  id: number
  src: string
  thumbnail?: string
  srcset?: string
  sizes?: string
  name?: string
  alt?: string
}

export type WooPrice = {
  price: string
  regular_price: string
  sale_price: string
  price_range?: { min_amount: string; max_amount: string } | null
  currency_code: string
  currency_symbol: string
  currency_minor_unit: number
  currency_decimal_separator: string
  currency_thousand_separator: string
  currency_prefix: string
  currency_suffix: string
}

export type WooAttributeTerm = {
  id: number
  name: string
  slug: string
  default?: boolean
}

export type WooProductAttribute = {
  id: number
  name: string
  taxonomy?: string | null
  has_variations: boolean
  terms: WooAttributeTerm[]
}

export type WooVariationSummary = {
  id: number
  attributes: Array<{ name: string; value: string | null }>
}

export type WooProduct = {
  id: number
  name: string
  slug: string
  parent: number
  type: string
  variation: string
  permalink: string
  sku: string
  short_description: string
  description: string
  on_sale: boolean
  prices: WooPrice
  price_html?: string
  average_rating: string
  review_count: number
  images: WooImage[]
  categories: Array<{ id: number; name: string; slug: string; link?: string }>
  attributes: WooProductAttribute[]
  variations?: WooVariationSummary[]
  has_options?: boolean
  is_purchasable: boolean
  is_in_stock: boolean
  is_on_backorder?: boolean
  stock_availability?: { text?: string; class?: string }
  add_to_cart?: {
    text?: string
    description?: string
    url?: string
    minimum?: number
    maximum?: number
    multiple_of?: number
  }
}

export type WooProductReview = {
  id: number
  date_created: string
  formatted_date_created?: string
  date_created_gmt?: string
  product_id: number
  product_name?: string
  product_permalink?: string
  product_image?: WooImage | null
  reviewer: string
  review: string
  rating: number
  verified: boolean
  reviewer_avatar_urls?: Record<string, string>
}

export type WooCartItem = {
  key: string
  id: number
  quantity: number
  name: string
  short_description: string
  prices: WooPrice
  totals: {
    line_subtotal: string
    line_total: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
  images: WooImage[]
  variation: Array<{ attribute: string; value: string }>
}

export type WooCart = {
  items: WooCartItem[]
  coupons: Array<{ code: string; discount_type: string; totals: { total_discount: string } }>
  totals: {
    total_items: string
    total_items_tax: string
    total_fees: string
    total_fees_tax: string
    total_discount: string
    total_discount_tax: string
    total_shipping: string
    total_shipping_tax: string
    total_price: string
    total_tax: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
  needs_payment: boolean
  needs_shipping: boolean
  has_calculated_shipping: boolean
  shipping_rates: Array<{
    package_id: number
    name: string
    destination: Record<string, string>
    shipping_rates: Array<{
      rate_id: string
      name: string
      description: string
      delivery_time: string
      price: string
      selected: boolean
    }>
  }>
  items_count: number
}
