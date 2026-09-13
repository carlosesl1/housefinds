import Link from 'next/link'
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Returns',
  description: 'Housefinds return guidance for online orders, including change-of-mind, damaged and incorrect items.',
}

export default function ReturnsPage() {
  return (
    <main className="bg-[#fbfaf7] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Back to shop</Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Housefinds returns</p>
            <h1 className="mt-4 text-[clamp(3.8rem,6vw,6.8rem)] font-semibold leading-[.88] tracking-[-.065em]">A clear way<br /><span className="text-[#557562]">to make it right.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">For most online purchases, you can tell us within 14 days of delivery that you want to return the item. Faulty, damaged or incorrect orders are handled separately so we can resolve the problem properly.</p>

            <div className="mt-8 rounded-[28px] bg-[#e6eee8] p-6">
              <ArrowPathIcon className="size-6 text-[#456b55]" />
              <p className="mt-4 text-xl font-semibold tracking-[-.03em]">14-day return request window</p>
              <p className="mt-2 text-sm leading-6 text-black/48">Start the return request within 14 days of receiving the order. Return instructions and the appropriate return destination will be provided for the specific order.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              ['1. Start the request', 'Use the contact details provided with your Housefinds order confirmation and include your order number, the item and the reason for the request.'],
              ['2. Wait for return instructions', 'Do not send the item to an address found elsewhere. Different products can have different return destinations, so use the instructions issued for your order.'],
              ['3. Send the item when required', 'For a change-of-mind return, keep the product and packaging in reasonable condition. We will explain the required return method before you send anything.'],
              ['4. Refund or resolution', 'Once the return or other agreed resolution is approved, the refund is issued to the original payment method. Your bank or payment provider may need additional processing time.'],
            ].map(([title, copy]) => (
              <section key={title} className="rounded-[28px] border border-black/[.06] bg-white p-6 sm:p-7">
                <h2 className="text-xl font-semibold tracking-[-.03em]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/50">{copy}</p>
              </section>
            ))}

            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 sm:p-7">
              <div className="flex gap-3"><ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><h2 className="font-semibold text-amber-950">Damaged, faulty or incorrect item?</h2><p className="mt-2 text-sm leading-6 text-amber-900/75">Contact Housefinds as soon as possible with the order number and clear photos or video where useful. Depending on the issue, the resolution may be a replacement, refund or a return.</p></div></div>
            </section>

            <section className="rounded-[28px] bg-[#172018] p-6 text-white sm:p-7">
              <CheckCircleIcon className="size-6 text-[#a8c6b0]" />
              <h2 className="mt-4 text-2xl font-semibold tracking-[-.04em]">Good to know</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Some legal exceptions can apply to particular categories of goods, such as personalised products or certain sealed hygiene goods once opened. If an exception is relevant, it should be made clear for that item.</p>
              <Link href="/faq" className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#172018]">Read the FAQ</Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
