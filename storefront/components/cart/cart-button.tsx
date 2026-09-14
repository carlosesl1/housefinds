'use client'

import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'

export function CartButton() {
  const count = useCart((state) => state.cart?.items_count || 0)
  const setOpen = useCart((state) => state.setOpen)
  return (
    <button className="hf-icon-button !size-10 !shadow-none hover:!shadow-[var(--hf-shadow-control)]" onClick={() => setOpen(true)} aria-label="Open cart">
      <ShoppingBagIcon className="size-5" />
      {count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--hf-brand)] text-[10px] font-bold text-white">{count}</span>}
    </button>
  )
}
