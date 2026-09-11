'use client'

import { useEffect } from 'react'
import { useCart } from '@/store/cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const refresh = useCart((state) => state.refresh)
  useEffect(() => { void refresh() }, [refresh])
  return <>{children}</>
}
