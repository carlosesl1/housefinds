import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'FAQ',
  description: 'Common Housefinds questions about products, delivery, returns, payments and split shipments.',
}

const faqs = [
  {
    q: 'Where does Housefinds deliver?',
    a: 'The storefront is currently being built around UK checkout and GBP pricing. Enter your delivery address at checkout to see the methods available for that destination.',
  },
  {
    q: 'How much is delivery?',
    a: 'Shipping is calculated from the delivery address and selected method. The charge is shown in the order summary before payment, rather than being added after card details are submitted.',
  },
  {
    q: 'Can different items arrive separately?',
    a: 'Yes. Housefinds works with fulfilment partners and different product locations, so a multi-item order can occasionally be split into separate parcels.',
  },
  {
    q: 'Can I return an item?',
    a: 'For most online purchases you can start a change-of-mind return request within 14 days of delivery. Faulty, damaged or incorrect products are handled separately so the appropriate resolution can be arranged.',
  },
  {
    q: 'What if the product arrives damaged or incorrect?',
    a: 'Keep the packaging and contact Housefinds using the details provided with your order. Include the order number and clear photos or video where useful. The resolution may be a replacement, refund or return depending on the case.',
  },
  {
    q: 'Are product reviews all from Housefinds customers?',
    a: 'Not necessarily. Reviews displayed for a product may include feedback collected for the same product on third-party marketplaces as well as feedback submitted directly to Housefinds. We label them as product reviews rather than presenting all of them as Housefinds purchases.',
  },
  {
    q: 'How are payments handled?',
    a: 'The checkout uses WooCommerce for the order and Stripe for card processing. Card details are entered in secure Stripe fields rather than stored by the Housefinds storefront.',
  },
  {
    q: 'Why do some products have several prices?',
    a: 'A price range means the product has variants, sizes, colours, capacities or other options with different prices. Choose the required options on the product page before adding the item to the cart.',
  },
]

export default function FAQPage() {
  return (
    <main className="bg-[#fbfaf7] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1120px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Back to shop</Link>

        <div className="mt-10 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Help centre</p>
          <h1 className="mt-4 text-[clamp(3.8rem,6vw,6.8rem)] font-semibold leading-[.88] tracking-[-.065em]">Questions before<br /><span className="text-[#557562]">you order.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/50">The useful details without making you hunt through fine print.</p>
        </div>

        <div className="mt-12 divide-y divide-black/[.07] border-y border-black/[.07]">
          {faqs.map((item, index) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left">
                <span className="flex gap-5"><span className="pt-1 text-xs font-semibold tracking-[.16em] text-black/28">{String(index + 1).padStart(2, '0')}</span><span className="text-xl font-semibold tracking-[-.025em] text-[#172018]">{item.q}</span></span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 text-lg text-black/45 transition group-open:rotate-45">+</span>
              </summary>
              <div className="max-w-3xl pb-7 pl-10 text-[15px] leading-7 text-black/52 sm:pl-[52px]">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link href="/shipping" className="group rounded-[28px] bg-[#e5ece6] p-6 transition hover:-translate-y-1"><p className="text-xs font-semibold uppercase tracking-[.18em] text-black/38">Delivery</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.04em]">Shipping & delivery</h2><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Read delivery information <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" /></span></Link>
          <Link href="/returns" className="group rounded-[28px] bg-[#eee9df] p-6 transition hover:-translate-y-1"><p className="text-xs font-semibold uppercase tracking-[.18em] text-black/38">After purchase</p><h2 className="mt-3 text-2xl font-semibold tracking-[-.04em]">Returns & problems</h2><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Read the return guidance <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" /></span></Link>
        </div>
      </div>
    </main>
  )
}
