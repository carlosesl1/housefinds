'use client'

import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'

export function CartButton() {
  const count = useCart((state) => state.cart?.items_count || 0)
  const setOpen = useCart((state) => state.setOpen)
  return (
    <button className="relative grid size-10 place-items-center rounded-full border border-black/10 bg-white transition hover:bg-stone-50" onClick={() => setOpen(true)} aria-label="Open cart">
      <ShoppingBagIcon className="size-5" />
      {count > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#355f4a] text-[10px] font-bold text-white">{count}</span>}
    </button>
  )
}
