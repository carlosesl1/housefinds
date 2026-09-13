import Link from 'next/link'
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Returns',
  description: 'Housefinds return guidance for online orders, including free change-of-mind returns and support for damaged or incorrect items.',
}

export default function ReturnsPage() {
  return (
    <main className="bg-[#fbfaf7] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Back to shop</Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Housefinds returns</p>
            <h1 className="mt-4 text-[clamp(3.8rem,6vw,6.8rem)] font-semibold leading-[.88] tracking-[-.065em]">Changed your mind?<br /><span className="text-[#557562]">We make returns simple.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">For most eligible online purchases, tell Housefinds within 14 days of delivery if you want to return the item. For an eligible change-of-mind return, Housefinds provides the return method without charging you return postage.</p>

            <div className="mt-8 rounded-[28px] bg-[#e6eee8] p-6">
              <ArrowPathIcon className="size-6 text-[#456b55]" />
              <p className="mt-4 text-xl font-semibold tracking-[-.03em]">Free 14-day returns</p>
              <p className="mt-2 text-sm leading-6 text-black/48">Start your return within 14 days of receiving the order. Once the request is accepted, follow the Housefinds return instructions for that order and send the item back within the return period provided.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              ['1. Contact Housefinds', 'Email contact@housefindsstore.com with your order number and the item you want to return. You do not need to give a reason for an eligible change-of-mind return.'],
              ['2. Receive your return instructions', 'Do not send the item to an address found elsewhere. Housefinds will provide the correct return method and destination for that specific order.'],
              ['3. Return the item', 'Keep the product in reasonable condition and package it securely. For an eligible return, use the return method provided by Housefinds rather than paying return postage yourself.'],
              ['4. Receive your refund', 'Once the returned item or acceptable proof of return is received and the return is confirmed, the refund is sent back to the original payment method. Payment providers can require additional processing time.'],
            ].map(([title, copy]) => (
              <section key={title} className="rounded-[28px] border border-black/[.06] bg-white p-6 sm:p-7">
                <h2 className="text-xl font-semibold tracking-[-.03em]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/50">{copy}</p>
              </section>
            ))}

            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 sm:p-7">
              <div className="flex gap-3"><ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><h2 className="font-semibold text-amber-950">Damaged, faulty or incorrect item?</h2><p className="mt-2 text-sm leading-6 text-amber-900/75">Contact Housefinds as soon as possible with the order number and clear photos or video where useful. Consumer rights for faulty, misdescribed or incorrect goods are separate from the change-of-mind return process.</p></div></div>
            </section>

            <section className="rounded-[28px] bg-[#172018] p-6 text-white sm:p-7">
              <CheckCircleIcon className="size-6 text-[#a8c6b0]" />
              <h2 className="mt-4 text-2xl font-semibold tracking-[-.04em]">Need to start a return?</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Include your Housefinds order number so we can give you the correct return instructions. Some legal exceptions can apply to specific categories such as personalised goods or certain sealed hygiene goods once opened.</p>
              <a href="mailto:contact@housefindsstore.com" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#172018]"><EnvelopeIcon className="size-4" /> contact@housefindsstore.com</a>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
