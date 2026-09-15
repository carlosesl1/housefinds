import Link from 'next/link'
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'About Housefinds',
  description: 'Housefinds curates clever, practical products for everyday life at home.',
}

export default function AboutPage() {
  return (
    <main className="bg-[var(--hf-background)]">
      <section className="border-b border-black/[.06] px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">About Housefinds</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <h1 className="text-[clamp(4rem,7vw,8rem)] font-semibold leading-[.86] tracking-[-.07em] text-[var(--hf-ink)]">Useful things.<br /><span className="text-[var(--hf-brand-muted)]">Less clutter.</span></h1>
            <p className="max-w-xl text-xl leading-8 text-black/50">Housefinds is a curated home-products store focused on small practical upgrades: products that save a little time, make a space work better or solve an everyday annoyance.</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-black/40">The filter</p>
            <h2 className="mt-4 text-5xl font-semibold leading-[.95] tracking-[-.055em]">What earns a place in the store?</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Useful', 'The product should solve a real, understandable need.'],
              ['Easy to grasp', 'A shopper should quickly understand what it does and why it helps.'],
              ['Worth the space', 'It should feel like a practical upgrade, not just another object.'],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-[var(--hf-radius-lg)] bg-[#f0f2ed] p-6">
                <CheckCircleIcon className="size-6 text-[var(--hf-brand-muted)]" />
                <h3 className="mt-8 text-2xl font-semibold tracking-[-.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/48">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#172018] px-5 py-20 text-white lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div><p className="text-[11px] font-semibold uppercase tracking-[.28em] text-white/40">Explore the catalog</p><h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[.92] tracking-[-.055em] sm:text-6xl">Start with a room, a routine or a small problem worth fixing.</h2></div>
          <div className="flex shrink-0 flex-wrap gap-3"><Link href="/shop" className="inline-flex h-13 items-center gap-2 rounded-full bg-[#dce8df] px-6 font-semibold text-[var(--hf-ink)]">Browse products <ArrowRightIcon className="size-4" /></Link><Link href="/search" className="inline-flex h-13 items-center rounded-full border border-white/20 px-6 font-semibold">Search</Link></div>
        </div>
      </section>
    </main>
  )
}
