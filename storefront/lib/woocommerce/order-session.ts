import 'server-only'
import { cookies } from 'next/headers'
import type { WooImage } from '@/lib/woocommerce/types'

const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')
export const LAST_ORDER_COOKIE = 'hf_last_order'

export type LastOrderSession = {
  order_id: number
  order_key: string
  billing_email: string
  order_number?: string
  created_at: number
}

export type WooStoreOrder = {
  id: number
  status: string
  order_number?: string
  needs_payment?: boolean
  needs_shipping?: boolean
  billing_address?: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    address_1?: string
    address_2?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  shipping_address?: {
    first_name?: string
    last_name?: string
    phone?: string
    address_1?: string
    address_2?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
  items?: Array<{
    key?: string
    id: number
    quantity: number
    name: string
    images?: WooImage[]
    variation?: Array<{ attribute?: string; value?: string }>
    item_data?: Array<{ key?: string; value?: string; display_key?: string; display_value?: string }>
    totals?: {
      line_total?: string
      currency_code?: string
      currency_symbol?: string
      currency_minor_unit?: number
    }
  }>
  totals?: {
    total_items?: string
    total_discount?: string
    total_shipping?: string
    total_tax?: string
    total_price?: string
    currency_code?: string
    currency_symbol?: string
    currency_minor_unit?: number
  }
}

export function decodeLastOrderSession(value?: string | null): LastOrderSession | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<LastOrderSession>
    if (!parsed.order_id || !parsed.order_key || !parsed.billing_email || !parsed.created_at) return null
    return {
      order_id: Number(parsed.order_id),
      order_key: String(parsed.order_key),
      billing_email: String(parsed.billing_email),
      order_number: parsed.order_number ? String(parsed.order_number) : undefined,
      created_at: Number(parsed.created_at),
    }
  } catch {
    return null
  }
}

export async function getLastOrderSession() {
  const cookieStore = await cookies()
  return decodeLastOrderSession(cookieStore.get(LAST_ORDER_COOKIE)?.value)
}

export async function getStoreOrder(session: LastOrderSession): Promise<WooStoreOrder | null> {
  const params = new URLSearchParams({
    key: session.order_key,
    billing_email: session.billing_email,
  })

  const response = await fetch(
    `${WC_URL}/wp-json/wc/store/v1/order/${encodeURIComponent(String(session.order_id))}?${params.toString()}`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' },
  )

  if (!response.ok) return null
  return response.json() as Promise<WooStoreOrder>
}

export async function getLastStoreOrder() {
  const session = await getLastOrderSession()
  if (!session) return { session: null, order: null }
  const order = await getStoreOrder(session)
  return { session, order }
}

export function estimatedDeliveryDate(createdAt: number) {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + 14)
  return date
}

export function formatUKDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function orderStatusCopy(status?: string) {
  switch (status) {
    case 'processing':
      return { label: 'Order confirmed', detail: 'Payment has been received and your order is being prepared.' }
    case 'on-hold':
      return { label: 'Order received', detail: 'Your order is on hold while payment or fulfilment is being confirmed.' }
    case 'completed':
      return { label: 'Order completed', detail: 'This order is marked complete in Housefinds. Carrier tracking, when available, is shown separately.' }
    case 'refunded':
      return { label: 'Refunded', detail: 'A refund has been recorded for this order.' }
    case 'cancelled':
      return { label: 'Cancelled', detail: 'This order has been cancelled.' }
    case 'failed':
      return { label: 'Payment failed', detail: 'The order was created but the payment did not complete successfully.' }
    case 'pending':
    case 'checkout-draft':
      return { label: 'Payment pending', detail: 'Your order is waiting for payment confirmation.' }
    default:
      return { label: 'Order received', detail: 'Housefinds has received your order.' }
  }
}
