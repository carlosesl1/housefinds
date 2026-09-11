'use client'

import { create } from 'zustand'
import type { WooCart } from '@/lib/woocommerce/types'

type CartStore = {
  cart: WooCart | null
  open: boolean
  loading: boolean
  setOpen: (open: boolean) => void
  refresh: () => Promise<void>
  add: (id: number, quantity?: number) => Promise<void>
  remove: (key: string) => Promise<void>
  update: (key: string, quantity: number) => Promise<void>
}

async function callCart(action?: string, body?: unknown) {
  const response = await fetch(`/api/cart${action ? `?action=${encodeURIComponent(action)}` : ''}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json() as Promise<WooCart>
}

export const useCart = create<CartStore>((set, get) => ({
  cart: null,
  open: false,
  loading: false,
  setOpen: (open) => set({ open }),
  refresh: async () => {
    set({ loading: true })
    try { set({ cart: await callCart() }) } finally { set({ loading: false }) }
  },
  add: async (id, quantity = 1) => {
    set({ loading: true })
    try {
      const cart = await callCart('add-item', { id, quantity })
      set({ cart, open: true })
    } finally { set({ loading: false }) }
  },
  remove: async (key) => {
    set({ loading: true })
    try { set({ cart: await callCart('remove-item', { key }) }) } finally { set({ loading: false }) }
  },
  update: async (key, quantity) => {
    if (quantity < 1) return get().remove(key)
    set({ loading: true })
    try { set({ cart: await callCart('update-item', { key, quantity }) }) } finally { set({ loading: false }) }
  },
}))
