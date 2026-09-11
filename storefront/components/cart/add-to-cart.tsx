'use client'

import { useCart } from '@/store/cart'

export function AddToCart({ productId, disabled = false, label = 'Add to cart' }: { productId: number; disabled?: boolean; label?: string }) {
  const add = useCart((state) => state.add)
  const loading = useCart((state) => state.loading)
  return <button disabled={disabled || loading} onClick={() => void add(productId)} className="h-12 rounded-full bg-[#355f4a] px-6 font-semibold text-white transition hover:bg-[#294b3a] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Adding…' : label}</button>
}
