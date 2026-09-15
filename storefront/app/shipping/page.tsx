import Link from 'next/link'
import { ArrowLeftIcon, MapPinIcon, TruckIcon, ClockIcon, ArchiveBoxIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Shipping & Delivery',
  description: 'Free UK delivery and Housefinds order updates, with an estimated delivery time of around 14 days.',
}

export default function ShippingPage() {
  return (
    <main className="bg-[var(--hf-background)] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1240px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Back to shop</Link>

        <div className="mt-10 max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">Shipping & delivery</p>
          <h1 className="mt-4 text-[clamp(3.8rem,6vw,7rem)] font-semibold leading-[.88] tracking-[-.065em]">Free UK delivery.<br /><span className="text-[var(--hf-brand-muted)]">No surprise shipping fee.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/50">Housefinds currently delivers to the United Kingdom. Standard delivery is free, and our current estimate is around 14 days from order confirmation. Any updated delivery information is shown with the order as it progresses.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            { icon: TruckIcon, title: 'Free standard UK delivery', copy: 'Housefinds absorbs the standard delivery cost, so there is no extra standard shipping charge added at checkout.' },
            { icon: ClockIcon, title: 'Around 14 days', copy: 'Our current estimated delivery time is around 14 days. Timing can vary by route, product and carrier, and we keep the order status updated when new information becomes available.' },
            { icon: MapPinIcon, title: 'UK delivery only for now', copy: 'At launch, Housefinds is focused on UK customers so delivery, pricing and checkout can stay clear and consistent.' },
            { icon: ArchiveBoxIcon, title: 'Orders can arrive separately', copy: 'If an order contains several items, they may occasionally be packed and dispatched separately and arrive in more than one parcel.' },
          ].map(({ icon: Icon, title, copy }) => (
            <section key={title} className="rounded-[30px] border border-black/[.06] bg-white p-7 shadow-[0_18px_60px_rgba(34,45,37,.035)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#e7eee9] text-[#456b55]"><Icon className="size-6" /></span>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-.04em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-black/48">{copy}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-[var(--hf-radius-lg)] bg-[#edf1ec] p-7 sm:p-9">
            <h2 className="text-3xl font-semibold tracking-[-.045em]">Order tracking and updates</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/52">Housefinds keeps the customer-facing order status in one place. When carrier tracking becomes available, it is linked to your order so you can follow the latest delivery information from the Housefinds tracking page.</p>
            <p className="mt-4 text-sm leading-7 text-black/52">Keep your order confirmation until every item has arrived. It contains the Housefinds order reference used for delivery support.</p>
          </section>

          <section className="rounded-[var(--hf-radius-lg)] bg-[#172018] p-7 text-white sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/40">Need delivery help?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em]">Talk to Housefinds.</h2>
            <p className="mt-4 text-sm leading-7 text-white/55">For an order update, include your Housefinds order number so we can identify the shipment quickly.</p>
            <a href="mailto:contact@housefindsstore.com" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#dce8df] px-5 py-3 text-sm font-semibold text-[var(--hf-ink)]"><EnvelopeIcon className="size-4" /> contact@housefindsstore.com</a>
          </section>
        </div>
      </div>
    </main>
  )
}
