'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'
import { formatProductPrice } from '@/lib/woocommerce/money'

type RecentProduct = {
  id: number
  slug: string
  name: string
  tagline: string
  price: string
  image: string
  viewedAt: number
}

const STORAGE_KEY = 'hf_recent_products_v1'
const MAX_STORED = 8

function readRecent(): RecentProduct[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentProduct[]
    return Array.isArray(parsed) ? parsed.filter((item) => item?.slug && item?.name).slice(0, MAX_STORED) : []
  } catch {
    return []
  }
}

export function RecentlyViewed({ product }: { product: WooProduct }) {
  const [items, setItems] = useState<RecentProduct[]>([])

  useEffect(() => {
    const previous = readRecent().filter((item) => item.id !== product.id)
    setItems(previous.slice(0, 4))

    const current: RecentProduct = {
      id: product.id,
      slug: product.slug,
      name: displayProductName(product.name),
      tagline: displayProductTagline(product),
      price: formatProductPrice(product),
      image: product.images?.[0]?.thumbnail || product.images?.[0]?.src || '',
      viewedAt: Date.now(),
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([current, ...previous].slice(0, MAX_STORED)))
    } catch {
      // Browsing history is optional; the product page works normally if storage is unavailable.
    }
  }, [product])

  if (!items.length) return null

  return (
    <section className="border-t border-black/[.06] bg-[#f3f2ed] px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1480px]">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-black/38">Recently viewed</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">Pick up where you left off.</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-semibold text-[#355f4a] sm:inline-flex">Browse all <ArrowRightIcon className="size-4" /></Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((item) => (
            <Link key={item.id} href={`/produto/${item.slug}`} className="group grid grid-cols-[74px_1fr] gap-3 rounded-[22px] bg-white p-3 shadow-[0_10px_35px_rgba(30,40,34,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_45px_rgba(30,40,34,.07)]">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#ecebe5]">
                {item.image && <Image src={item.image} alt="" fill sizes="74px" className="object-cover" />}
              </div>
              <div className="min-w-0 self-center">
                <p className="line-clamp-2 text-sm font-semibold leading-5 tracking-[-.02em]">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-black/52">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
