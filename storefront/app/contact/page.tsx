import Link from 'next/link'
import { ArrowRightIcon, ArrowUturnLeftIcon, EnvelopeIcon, QuestionMarkCircleIcon, TruckIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Contact Housefinds',
  description: 'Contact Housefinds customer support about orders, delivery, returns and product questions.',
}

export default function ContactPage() {
  return (
    <main className="bg-[#fbfaf7] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Customer support</p>
            <h1 className="mt-4 text-[clamp(3.8rem,6vw,6.8rem)] font-semibold leading-[.88] tracking-[-.065em]">Tell us what<br /><span className="text-[#557562]">you need help with.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">Questions about an order, delivery, a return or a product? Contact Housefinds directly and include the useful details so we can understand the issue quickly.</p>

            <a href="mailto:contact@housefindsstore.com" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#355f4a] px-6 py-3.5 text-sm font-semibold text-white">
              <EnvelopeIcon className="size-5" /> contact@housefindsstore.com
            </a>
            <p className="mt-4 max-w-md text-xs leading-5 text-black/38">For an existing order, include the Housefinds order number and the email used at checkout. Never send card numbers or security codes by email.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/track-order" className="group rounded-[28px] border border-black/[.06] bg-white p-6 shadow-[0_16px_55px_rgba(31,42,34,.035)] transition hover:-translate-y-0.5">
              <TruckIcon className="size-6 text-[#557562]" />
              <h2 className="mt-5 text-2xl font-semibold tracking-[-.04em]">Where is my order?</h2>
              <p className="mt-3 text-sm leading-6 text-black/48">Check the latest Housefinds order status and carrier information when it becomes available.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Track an order <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" /></span>
            </Link>

            <Link href="/returns" className="group rounded-[28px] border border-black/[.06] bg-white p-6 shadow-[0_16px_55px_rgba(31,42,34,.035)] transition hover:-translate-y-0.5">
              <ArrowUturnLeftIcon className="size-6 text-[#557562]" />
              <h2 className="mt-5 text-2xl font-semibold tracking-[-.04em]">Return or problem</h2>
              <p className="mt-3 text-sm leading-6 text-black/48">Start a return or see what to send if an item arrived damaged, faulty or incorrect.</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Returns & problems <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" /></span>
            </Link>

            <Link href="/shipping" className="group rounded-[28px] border border-black/[.06] bg-[#eef1ec] p-6 transition hover:-translate-y-0.5">
              <TruckIcon className="size-6 text-[#557562]" />
              <h2 className="mt-5 text-xl font-semibold tracking-[-.035em]">Delivery information</h2>
              <p className="mt-2 text-sm leading-6 text-black/48">Free UK delivery and the current timing guidance.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Shipping & delivery <ArrowRightIcon className="size-4" /></span>
            </Link>

            <Link href="/faq" className="group rounded-[28px] border border-black/[.06] bg-[#eee9df] p-6 transition hover:-translate-y-0.5">
              <QuestionMarkCircleIcon className="size-6 text-[#557562]" />
              <h2 className="mt-5 text-xl font-semibold tracking-[-.035em]">Common questions</h2>
              <p className="mt-2 text-sm leading-6 text-black/48">Payments, reviews, variants, returns and order questions.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Read the FAQ <ArrowRightIcon className="size-4" /></span>
            </Link>
          </div>
        </div>

        <section className="mt-14 rounded-[32px] bg-[#172018] p-7 text-white sm:p-9">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/40">Damaged, faulty or incorrect?</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">A short video or clear photos can speed things up.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">For the fastest assessment, include the order number and evidence showing the issue where reasonably practical. Housefinds can then arrange the appropriate refund or replacement where applicable. This does not affect statutory rights.</p></div>
            <a href="mailto:contact@housefindsstore.com?subject=Order%20problem" className="inline-flex h-12 items-center justify-center rounded-full bg-[#dce8df] px-5 text-sm font-semibold text-[#172018]">Email support</a>
          </div>
        </section>
      </div>
    </main>
  )
}
