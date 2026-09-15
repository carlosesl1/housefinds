'use client'

import { useEffect } from 'react'
import { moneyValue, trackStorefrontEvent } from '@/lib/storefront/analytics'

export function ProductViewTracker({ id, name, price, currency = 'GBP', minorUnit = 2 }: { id: number; name: string; price: string; currency?: string; minorUnit?: number }) {
  useEffect(() => {
    trackStorefrontEvent({
      event: 'view_item',
      ecommerce: {
        currency,
        value: moneyValue(price, minorUnit),
        items: [{ item_id: String(id), item_name: name, price: moneyValue(price, minorUnit), quantity: 1 }],
      },
    })
  }, [id, name, price, currency, minorUnit])
  return null
}
