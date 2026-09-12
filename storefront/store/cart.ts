'use client'

import { create } from 'zustand'
import type { WooCart } from '@/lib/woocommerce/types'

type CartStore = {
  cart: WooCart | null
  open: boolean
  loading: boolean
  error: string | null
  setOpen: (open: boolean) => void
  clearError: () => void
  refresh: () => Promise<void>
  add: (id: number, quantity?: number, variation?: Array<{ attribute: string; value: string }>) => Promise<void>
  remove: (key: string) => Promise<void>
  update: (key: string, quantity: number) => Promise<void>
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
    // Open immediately so failed Store API calls are visible to the shopper.
    set({ loading: true, open: true, error: null })
    try {
      const payload = variation?.length ? { id, quantity, variation } : { id, quantity }
      const cart = await callCart('add-item', payload)
      set({ cart, open: true })
    } catch (error) {
      set({ error: messageFromError(error), open: true })
    } finally {
      set({ loading: false })
    }
  },
  remove: async (key) => {
    set({ loading: true, error: null })
    try {
      set({ cart: await callCart('remove-item', { key }) })
    } catch (error) {
      set({ error: messageFromError(error) })
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
      set({ error: messageFromError(error) })
    } finally {
      set({ loading: false })
    }
  },
}))
