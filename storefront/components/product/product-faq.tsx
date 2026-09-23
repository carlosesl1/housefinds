import Link from 'next/link'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { getProductContent } from '@/lib/storefront/product-content'

type Question = { q: string; a: React.ReactNode }

export function ProductFAQ({ product }: { product: WooProduct }) {
  const specific: Question[] = getProductContent(product)?.questions || (/homefish|aurora projector|ocean wave/i.test(product.name) ? [
    { q: 'What is the projector designed for?', a: 'Ambient colour and atmosphere for bedrooms, desks and quiet corners, rather than replacing task lighting.' },
    { q: 'Can I change the colours?', a: 'The listing includes multiple RGB colour modes and remote-controlled adjustments. Review the selected option for its available effects.' },
  ] : [])
  const common: Question[] = [
    { q: 'How much is UK delivery?', a: <>Standard UK delivery is free, with a current estimate of around 14 days. It is an estimate rather than a guaranteed arrival date. <Link href="/shipping" className="font-semibold text-[var(--hf-brand)] underline underline-offset-4">Delivery details</Link>.</> },
    { q: 'What if my item arrives damaged, faulty or incorrect?', a: <>Contact Housefinds with your order number and a description of the problem. Clear photos can help us resolve it where practical. See <Link href="/returns" className="font-semibold text-[var(--hf-brand)] underline underline-offset-4">returns and problems</Link> for support and your rights.</> },
    { q: 'Can I return it if I change my mind?', a: <>Eligible orders include free 14-day returns. Tell us within 14 days of delivery and follow the return instructions for your order. Read the <Link href="/returns" className="font-semibold text-[var(--hf-brand)] underline underline-offset-4">returns policy</Link>.</> },
  ]
  return (
    <section id="product-questions" className="scroll-mt-24 border-b border-black/[.06] bg-[#f3f4ef] py-12 lg:py-16">
      <div className="hf-container grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
        <div>
          <p className="hf-eyebrow text-[var(--hf-brand)]">Product questions</p>
          <h2 className="mt-4 max-w-sm text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-[1.08] tracking-[-.04em]">A few helpful answers.</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-black/65">Need help with a size, option or order? Ask us before you choose.</p>
          <a href={`mailto:contact@housefindsstore.com?subject=${encodeURIComponent(`Product question: ${product.id}`)}`} className="hf-button-tertiary mt-5">Ask Housefinds</a>
        </div>
        <div className="min-w-0 space-y-3">
          {[...specific, ...common].map((faq, index) => <details key={faq.q} className="group rounded-[var(--hf-radius-md)] border border-black/[.08] bg-white/90 px-5 sm:px-6" open={index === 0 && specific.length > 0}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-[var(--hf-radius-md)] py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hf-brand)]">
              <span className="text-base font-semibold leading-6 tracking-[-.015em]">{faq.q}</span><ChevronDownIcon className="size-4 shrink-0 text-[var(--hf-brand)] transition-transform motion-reduce:transition-none group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-black/[.06] pb-5 pt-4 text-sm leading-7 text-black/65">{faq.a}</div>
          </details>)}
        </div>
      </div>
    </section>
  )
}
