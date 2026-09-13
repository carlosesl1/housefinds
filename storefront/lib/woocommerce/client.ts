import 'server-only'
import type { WooProduct, WooProductReview } from './types'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const API = `${WC_URL}/wp-json/wc/store/v1`

async function wooFetch<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const defaultRevalidate = process.env.NODE_ENV === 'development' ? 0 : 60
  const { revalidate = defaultRevalidate, ...request } = init || {}
  const isMutation = Boolean(request.method && request.method !== 'GET')
  const noCache = isMutation || revalidate === 0

  const response = await fetch(`${API}${path}`, {
    ...request,
    headers: { Accept: 'application/json', ...(request.headers || {}) },
    next: noCache ? undefined : { revalidate },
    cache: noCache ? 'no-store' : undefined,
  })

  if (!response.ok) {
    throw new Error(`WooCommerce Store API ${response.status}: ${await response.text()}`)
  }

  return response.json() as Promise<T>
}

export async function getProducts(params: {
  per_page?: number
  category?: string
  search?: string
  orderby?: string
  order?: 'asc' | 'desc'
  related?: number
  on_sale?: boolean
} = {}) {
  const qs = new URLSearchParams()
  qs.set('per_page', String(params.per_page || 12))
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  if (params.orderby) qs.set('orderby', params.orderby)
  if (params.order) qs.set('order', params.order)
  if (params.related) qs.set('related', String(params.related))
  if (params.on_sale !== undefined) qs.set('on_sale', String(params.on_sale))
  return wooFetch<WooProduct[]>(`/products?${qs.toString()}`)
}

export async function getProductBySlug(slug: string) {
  const products = await wooFetch<WooProduct[]>(`/products?slug=${encodeURIComponent(slug)}`)
  return products[0] || null
}

export async function getProductReviews(productId?: number, perPage = 12) {
  const qs = new URLSearchParams()
  qs.set('per_page', String(perPage))
  qs.set('orderby', 'date')
  qs.set('order', 'desc')
  if (productId) qs.set('product_id', String(productId))
  return wooFetch<WooProductReview[]>(`/products/reviews?${qs.toString()}`, { revalidate: 120 })
}

export async function getRelatedProducts(productId: number, perPage = 8) {
  return getProducts({ per_page: perPage, related: productId })
}
