import 'server-only'
import type { WooProduct } from './types'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
const API = `${WC_URL}/wp-json/wc/store/v1`

async function wooFetch<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const { revalidate = 60, ...request } = init || {}
  const response = await fetch(`${API}${path}`, {
    ...request,
    headers: { Accept: 'application/json', ...(request.headers || {}) },
    next: request.method && request.method !== 'GET' ? undefined : { revalidate },
    cache: request.method && request.method !== 'GET' ? 'no-store' : undefined,
  })

  if (!response.ok) {
    throw new Error(`WooCommerce Store API ${response.status}: ${await response.text()}`)
  }

  return response.json() as Promise<T>
}

export async function getProducts(params: { per_page?: number; category?: string; search?: string; orderby?: string; order?: 'asc' | 'desc' } = {}) {
  const qs = new URLSearchParams()
  qs.set('per_page', String(params.per_page || 12))
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  if (params.orderby) qs.set('orderby', params.orderby)
  if (params.order) qs.set('order', params.order)
  return wooFetch<WooProduct[]>(`/products?${qs.toString()}`)
}

export async function getProductBySlug(slug: string) {
  const products = await wooFetch<WooProduct[]>(`/products?slug=${encodeURIComponent(slug)}`)
  return products[0] || null
}

export function formatMoney(amount: string | number, minorUnit = 2, symbol = '£') {
  const value = typeof amount === 'string' ? Number(amount) : amount
  return `${symbol}${(value / Math.pow(10, minorUnit)).toFixed(minorUnit)}`
}
