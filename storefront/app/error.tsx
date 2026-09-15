'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[housefinds-ui]', error)
  }, [error])

  return (
    <main className="bg-[var(--hf-background)] px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-3xl rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white p-8 text-center shadow-[0_24px_90px_rgba(30,40,34,.06)] sm:p-12">
        <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">Something interrupted the page</p>
        <h1 className="mt-5 text-5xl font-semibold leading-[.95] tracking-[-.06em] text-[var(--hf-ink)]">The store hit a temporary snag.</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-black/48">Your cart is kept separately, so retrying the page should not remove the items you have already added.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="inline-flex h-13 items-center gap-2 rounded-full bg-[var(--hf-brand)] px-6 font-semibold text-white"><ArrowPathIcon className="size-4" /> Try again</button>
          <Link href="/" className="inline-flex h-13 items-center gap-2 rounded-full border border-black/10 bg-white px-6 font-semibold"><HomeIcon className="size-4" /> Home</Link>
        </div>
      </div>
    </main>
  )
}
