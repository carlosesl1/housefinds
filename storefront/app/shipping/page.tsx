import Link from 'next/link'
import { ArrowLeftIcon, MapPinIcon, TruckIcon, ClockIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Shipping & Delivery',
  description: 'How Housefinds calculates delivery options, costs and order updates for UK customers.',
}

export default function ShippingPage() {
  return (
    <main className="bg-[#fbfaf7] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1240px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Back to shop</Link>

        <div className="mt-10 max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Shipping & delivery</p>
          <h1 className="mt-4 text-[clamp(3.8rem,6vw,7rem)] font-semibold leading-[.88] tracking-[-.065em]">See the delivery choice<br /><span className="text-[#557562]">before you pay.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/50">Housefinds calculates available delivery methods from your destination during checkout. The shipping cost is added to the order total before payment, so it is not hidden after you enter your card details.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            { icon: MapPinIcon, title: 'Calculated for your address', copy: 'Enter your delivery address and postcode at checkout. WooCommerce returns the delivery methods available for that destination.' },
            { icon: TruckIcon, title: 'Cost shown before payment', copy: 'The selected shipping method and its price are included in the order summary before the payment step.' },
            { icon: ClockIcon, title: 'Timing depends on the method', copy: 'When a delivery estimate is supplied for the selected method, it is shown with the option. Do not rely on a generic site-wide promise when the actual route can vary.' },
            { icon: ArchiveBoxIcon, title: 'Orders can arrive separately', copy: 'Housefinds works with fulfilment partners and different product locations. If an order contains multiple items, they may occasionally arrive in more than one parcel.' },
          ].map(({ icon: Icon, title, copy }) => (
            <section key={title} className="rounded-[30px] border border-black/[.06] bg-white p-7 shadow-[0_18px_60px_rgba(34,45,37,.035)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#e7eee9] text-[#456b55]"><Icon className="size-6" /></span>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-.04em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-black/48">{copy}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <section className="rounded-[32px] bg-[#edf1ec] p-7 sm:p-9">
            <h2 className="text-3xl font-semibold tracking-[-.045em]">Tracking and order updates</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-black/52">When tracking information is available for the shipment, it can be associated with the order and used for delivery updates. If an order is split into more than one parcel, individual parcels may receive separate tracking events.</p>
            <p className="mt-4 text-sm leading-7 text-black/52">Keep your order confirmation until every item has arrived. It contains the order reference needed if you contact Housefinds about delivery.</p>
          </section>

          <section className="rounded-[32px] bg-[#172018] p-7 text-white sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/40">Before ordering</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em]">Check the checkout total.</h2>
            <p className="mt-4 text-sm leading-7 text-white/55">The checkout is the source of truth for the delivery methods currently offered to your address and the final shipping charge.</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#dce8df] px-5 py-3 text-sm font-semibold text-[#172018]">Browse products</Link>
          </section>
        </div>
      </div>
    </main>
  )
}
