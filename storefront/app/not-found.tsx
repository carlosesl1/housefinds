import Link from 'next/link'
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <main className="bg-[var(--hf-background)] px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">404 · Nothing useful here</p>
        <h1 className="mt-5 text-[clamp(4rem,8vw,8rem)] font-semibold leading-[.86] tracking-[-.07em] text-[var(--hf-ink)]">This find<br /><span className="text-[var(--hf-brand-muted)]">moved on.</span></h1>
        <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-black/48">The product or page may have changed, but the rest of the collection is still easy to explore.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="inline-flex h-14 items-center gap-2 rounded-full bg-[var(--hf-brand)] px-7 font-semibold text-white">Browse the shop <ArrowRightIcon className="size-4" /></Link>
          <Link href="/search" className="inline-flex h-14 items-center gap-2 rounded-full border border-black/10 bg-white px-7 font-semibold"><MagnifyingGlassIcon className="size-4" /> Search products</Link>
        </div>
      </div>
    </main>
  )
}
