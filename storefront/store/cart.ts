'use client'

import { create } from 'zustand'
import type { WooCart } from '@/lib/woocommerce/types'

export type CheckoutAddress = {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  state?: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

type CartStore = {
  cart: WooCart | null
  open: boolean
  loading: boolean
  error: string | null
  setOpen: (open: boolean) => void
  clearError: () => void
  refresh: () => Promise<void>
  add: (id: number, quantity?: number, variation?: Array<{ attribute: string; value: string }>) => Promise<boolean>
  remove: (key: string) => Promise<void>
  update: (key: string, quantity: number) => Promise<void>
  updateCustomer: (address: CheckoutAddress) => Promise<boolean>
  selectShipping: (packageId: number, rateId: string) => Promise<boolean>
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: (code: string) => Promise<boolean>
}

function cartErrorDetails(error: unknown) {
  if (!(error instanceof Error)) return { message: 'Something went wrong with the cart.', refreshCart: false }
  try {
    const parsed = JSON.parse(error.message) as { message?: string; refresh_cart?: boolean }
    return { message: parsed.message || error.message, refreshCart: Boolean(parsed.refresh_cart) }
  } catch {
    return { message: error.message, refreshCart: false }
  }
}

function messageFromError(error: unknown) {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { message?: string }
      return parsed.message || error.message
    } catch {
      return error.message
    }
  }
  return 'Something went wrong with the cart.'
}

async function callCart(action?: string, body?: unknown) {
  const response = await fetch(`/api/cart${action ? `?action=${encodeURIComponent(action)}` : ''}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  const text = await response.text()
  if (!response.ok) throw new Error(text || `Cart request failed (${response.status})`)
  return JSON.parse(text) as WooCart
}

export const useCart = create<CartStore>((set, get) => ({
  cart: null,
  open: false,
  loading: false,
  error: null,
  setOpen: (open) => set({ open }),
  clearError: () => set({ error: null }),
  refresh: async () => {
    set({ loading: true, error: null })
    try {
      set({ cart: await callCart() })
    } catch (error) {
      set({ error: messageFromError(error) })
    } finally {
      set({ loading: false })
    }
  },
  add: async (id, quantity = 1, variation) => {
    set({ loading: true, open: true, error: null })
    try {
      const payload = variation?.length ? { id, quantity, variation } : { id, quantity }
      const cart = await callCart('add-item', payload)
      set({ cart, open: true })
      return true
    } catch (error) {
      const details = cartErrorDetails(error)
      set({ error: details.message, open: true })
      if (details.refreshCart) {
        try { set({ cart: await callCart() }) } catch {}
      }
      return false
    } finally {
      set({ loading: false })
    }
  },
  remove: async (key) => {
    set({ loading: true, error: null })
    try {
      set({ cart: await callCart('remove-item', { key }) })
    } catch (error) {
      const details = cartErrorDetails(error)
      set({ error: details.message })
      if (details.refreshCart) { try { set({ cart: await callCart() }) } catch {} }
    } finally {
      set({ loading: false })
    }
  },
  update: async (key, quantity) => {
    if (quantity < 1) return get().remove(key)
    set({ loading: true, error: null })
    try {
      set({ cart: await callCart('update-item', { key, quantity }) })
    } catch (error) {
      const details = cartErrorDetails(error)
      set({ error: details.message })
      if (details.refreshCart) { try { set({ cart: await callCart() }) } catch {} }
    } finally {
      set({ loading: false })
    }
  },
  updateCustomer: async (address) => {
    set({ loading: true, error: null })
    try {
      const cart = await callCart('update-customer', {
        billing_address: address,
        shipping_address: address,
      })
      set({ cart })
      return true
    } catch (error) {
      set({ error: messageFromError(error) })
      return false
    } finally {
      set({ loading: false })
    }
  },
  selectShipping: async (packageId, rateId) => {
    set({ loading: true, error: null })
    try {
      const cart = await callCart('select-shipping-rate', {
        package_id: packageId,
        rate_id: rateId,
      })
      set({ cart })
      return true
    } catch (error) {
      set({ error: messageFromError(error) })
      return false
    } finally {
      set({ loading: false })
    }
  },
  applyCoupon: async (code) => {
    const normalized = code.trim()
    if (!normalized) return false
    set({ loading: true, error: null })
    try {
      const cart = await callCart('apply-coupon', { code: normalized })
      set({ cart })
      return true
    } catch (error) {
      set({ error: messageFromError(error) })
      return false
    } finally {
      set({ loading: false })
    }
  },
  removeCoupon: async (code) => {
    set({ loading: true, error: null })
    try {
      const cart = await callCart('remove-coupon', { code })
      set({ cart })
      return true
    } catch (error) {
      set({ error: messageFromError(error) })
      return false
    } finally {
      set({ loading: false })
    }
  },
}))
