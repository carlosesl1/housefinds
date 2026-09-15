'use client'

import { useEffect } from 'react'
import { moneyValue, trackStorefrontEvent } from '@/lib/storefront/analytics'

type PurchaseItem = { id: number; name: string; quantity: number; lineTotal?: string }

export function PurchaseTracker({ transactionId, total, currency = 'GBP', minorUnit = 2, items }: { transactionId: string; total: string; currency?: string; minorUnit?: number; items: PurchaseItem[] }) {
  useEffect(() => {
    const key = `hf_purchase_tracked_${transactionId}`
    try {
      if (window.localStorage.getItem(key)) return
      trackStorefrontEvent({
        event: 'purchase',
        ecommerce: {
          transaction_id: transactionId,
          currency,
          value: moneyValue(total, minorUnit),
          items: items.map((item) => ({
            item_id: String(item.id),
            item_name: item.name,
            quantity: item.quantity,
            price: item.lineTotal ? moneyValue(item.lineTotal, minorUnit) / Math.max(1, item.quantity) : undefined,
          })),
        },
      })
      window.localStorage.setItem(key, '1')
    } catch {
      trackStorefrontEvent({ event: 'purchase', ecommerce: { transaction_id: transactionId, currency, value: moneyValue(total, minorUnit) } })
    }
  }, [transactionId, total, currency, minorUnit, items])
  return null
}
