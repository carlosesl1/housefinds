'use client'

import { useEffect } from 'react'
import { trackStorefrontEvent } from '@/lib/storefront/analytics'

export function SearchTracker({ query, resultCount }: { query: string; resultCount: number }) {
  useEffect(() => {
    if (!query) return
    trackStorefrontEvent({ event: 'search', search_term: query, result_count: resultCount })
  }, [query, resultCount])
  return null
}
