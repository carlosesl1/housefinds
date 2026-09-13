import Link from 'next/link'
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, EnvelopeIcon, VideoCameraIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Returns',
  description: 'Housefinds return guidance for UK online orders, including free 14-day returns and support for damaged, faulty or incorrect items.',
}

export default function ReturnsPage() {
  return (
    <main className="bg-[#fbfaf7] px-5 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-black/45 transition hover:text-black"><ArrowLeftIcon className="size-4" /> Back to shop</Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Housefinds returns & support</p>
            <h1 className="mt-4 text-[clamp(3.8rem,6vw,6.8rem)] font-semibold leading-[.88] tracking-[-.065em]">If something is not right,<br /><span className="text-[#557562]">we make it right.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/50">UK orders include free 14-day change-of-mind returns on eligible items. If a product arrives damaged, faulty or incorrect, contact Housefinds and we will help arrange the appropriate resolution.</p>

            <div className="mt-8 rounded-[28px] bg-[#e6eee8] p-6">
              <ArrowPathIcon className="size-6 text-[#456b55]" />
              <p className="mt-4 text-xl font-semibold tracking-[-.03em]">Free 14-day returns</p>
              <p className="mt-2 text-sm leading-6 text-black/48">For eligible online orders, tell us within 14 days of receiving the item that you want to return it. Housefinds will provide the correct instructions and an eligible return method at no cost to you.</p>
            </div>

            <div className="mt-4 rounded-[28px] border border-[#b8cec0] bg-white p-6">
              <VideoCameraIcon className="size-6 text-[#456b55]" />
              <p className="mt-4 text-xl font-semibold tracking-[-.03em]">14-day damage support</p>
              <p className="mt-2 text-sm leading-6 text-black/48">If an item arrives damaged, faulty or materially different from what you ordered, contact us within 14 days for the fastest resolution. We may ask for clear photos or a short video showing the issue so we can assess it quickly.</p>
              <p className="mt-3 text-sm font-semibold text-[#355f4a]">Where appropriate, the resolution can be a replacement or a refund to the original payment method.</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              ['1. Contact Housefinds', 'Email contact@housefindsstore.com with your order number, the item involved and a short description of what happened.'],
              ['2. Show us the issue', 'For damage, faults or an incorrect item, clear photos or a short video are usually the fastest way for us to verify the problem. If video is not practical, contact us and we will explain another suitable way to provide evidence.'],
              ['3. Choose the appropriate resolution', 'Depending on the issue and your legal rights, we can arrange a replacement, a refund, or a return. If a return is required, we will provide the correct instructions before you send anything.'],
              ['4. Refunds go back to the original payment method', 'Once a refund is approved and issued, your bank or payment provider may need additional processing time before the funds appear in your account.'],
            ].map(([title, copy]) => (
              <section key={title} className="rounded-[28px] border border-black/[.06] bg-white p-6 sm:p-7">
                <h2 className="text-xl font-semibold tracking-[-.03em]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-black/50">{copy}</p>
              </section>
            ))}

            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 sm:p-7">
              <div className="flex gap-3"><ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><h2 className="font-semibold text-amber-950">Do not send a return before receiving instructions.</h2><p className="mt-2 text-sm leading-6 text-amber-900/75">Return destinations can vary by order. Contact Housefinds first so we can provide the correct return method and destination for your item.</p></div></div>
            </section>

            <section className="rounded-[28px] bg-[#172018] p-6 text-white sm:p-7">
              <CheckCircleIcon className="size-6 text-[#a8c6b0]" />
              <h2 className="mt-4 text-2xl font-semibold tracking-[-.04em]">Your statutory rights are not reduced.</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">The Housefinds return and damage-support process is designed to make resolution faster. It does not replace or limit the rights you may have under UK consumer law for goods that are faulty, damaged, not fit for purpose or not as described.</p>
              <p className="mt-3 text-sm leading-6 text-white/60">UK consumer law can provide rights beyond our 14-day service window, including a short-term right to reject faulty goods and additional repair, replacement or refund rights.</p>
              <a href="mailto:contact@housefindsstore.com" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#172018]"><EnvelopeIcon className="size-4" /> contact@housefindsstore.com</a>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
