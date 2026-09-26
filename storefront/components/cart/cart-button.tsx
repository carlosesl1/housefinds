'use client'

import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'

export function CartButton() {
  const count = useCart((state) => state.cart?.items_count || 0)
  const setOpen = useCart((state) => state.setOpen)
  return (
    <button className="hf-cart-trigger" onClick={() => setOpen(true)} aria-label="Open cart">
      <ShoppingBagIcon className="size-5" />
      <span className="hf-cart-label" aria-hidden="true">Cart</span>
      {count > 0 && <span className="hf-cart-count">({count})</span>}
    </button>
  )
}
