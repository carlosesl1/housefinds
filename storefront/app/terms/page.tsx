import Link from 'next/link'
import { SELLER_BUSINESS_ADDRESS, SELLER_COMPANY_NUMBER, SELLER_IDENTITY_COMPLETE, SELLER_LEGAL_NAME, SUPPORT_EMAIL } from '@/lib/storefront/legal'

export const metadata = {
  title: 'Terms of sale',
  description: 'Housefinds terms covering UK orders, payment, delivery, returns and customer support.',
}

export default function TermsPage() {
  return (
    <main className="hf-page">
      <div className="hf-container max-w-[1120px] py-14 lg:py-20">
        <Link href="/" className="text-sm font-semibold text-[var(--hf-brand)] hover:underline">← Back to Housefinds</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Terms of sale</p>
            <h1 className="mt-4 text-[clamp(3rem,5vw,5.4rem)] font-semibold leading-[.92] tracking-[-.06em]">The practical terms behind a Housefinds order.</h1>
            <p className="hf-copy-lg mt-6 max-w-lg">These terms apply to purchases made through the Housefinds storefront for delivery to United Kingdom addresses.</p>
          </div>

          <div className="space-y-3">
            <section className="hf-panel p-6 sm:p-7">
              <h2 className="text-xl font-semibold tracking-[-.03em]">Seller and contact</h2>
              <dl className="mt-4 grid gap-3 text-sm leading-6 text-black/60">
                <div><dt className="font-semibold text-[var(--hf-ink)]">Seller</dt><dd>{SELLER_LEGAL_NAME}</dd></div>
                {SELLER_BUSINESS_ADDRESS && <div><dt className="font-semibold text-[var(--hf-ink)]">Geographical business address</dt><dd>{SELLER_BUSINESS_ADDRESS}</dd></div>}
                {SELLER_COMPANY_NUMBER && <div><dt className="font-semibold text-[var(--hf-ink)]">Company / registration number</dt><dd>{SELLER_COMPANY_NUMBER}</dd></div>}
                <div><dt className="font-semibold text-[var(--hf-ink)]">Customer support</dt><dd><a className="text-[var(--hf-brand)] underline underline-offset-3" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></dd></div>
              </dl>
              {!SELLER_IDENTITY_COMPLETE && <p className="mt-5 rounded-[var(--hf-radius-sm)] border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><strong>Seller address not yet configured in the storefront.</strong> Contact Housefinds before placing a commercial order if you need the seller’s current geographical business address. This field must be configured before the store is treated as fully launch-ready.</p>}
            </section>

            <section className="hf-panel p-6 sm:p-7"><h2 className="text-xl font-semibold tracking-[-.03em]">Products, prices and availability</h2><p className="mt-3 text-sm leading-7 text-black/58">Product information, current price and available variants are shown on the relevant product page. Prices are displayed in GBP. A product or variant can become unavailable before an order is accepted. Housefinds does not rely on fake scarcity, inherited marketplace promotions or arbitrary crossed-out prices.</p></section>
            <section className="hf-panel p-6 sm:p-7"><h2 className="text-xl font-semibold tracking-[-.03em]">Orders and payment</h2><p className="mt-3 text-sm leading-7 text-black/58">Orders are placed as guest purchases and payment is currently taken by card through Stripe. The amount due is shown before payment. For the initial launch, baskets must remain below £135. If the basket total changes before payment, the storefront will ask you to review the updated total before confirming again.</p></section>
            <section className="hf-panel p-6 sm:p-7"><h2 className="text-xl font-semibold tracking-[-.03em]">UK delivery</h2><p className="mt-3 text-sm leading-7 text-black/58">Standard UK delivery is free. The current estimate is around 14 days and is not a guaranteed arrival date. Delivery availability is confirmed from the delivery address entered at checkout. See <Link href="/shipping" className="font-semibold text-[var(--hf-brand)] underline underline-offset-3">Shipping & delivery</Link> for the current guidance.</p></section>
            <section className="hf-panel p-6 sm:p-7"><h2 className="text-xl font-semibold tracking-[-.03em]">Returns, faults and incorrect items</h2><p className="mt-3 text-sm leading-7 text-black/58">Eligible online orders include free 14-day change-of-mind returns. If goods arrive damaged, faulty or incorrect, contact Housefinds with the order number and useful evidence where reasonably practical so the issue can be assessed. This process does not replace or reduce statutory consumer rights. See <Link href="/returns" className="font-semibold text-[var(--hf-brand)] underline underline-offset-3">Returns & problems</Link>.</p></section>
            <section className="hf-panel p-6 sm:p-7"><h2 className="text-xl font-semibold tracking-[-.03em]">Order information and support</h2><p className="mt-3 text-sm leading-7 text-black/58">After a successful order, keep the Housefinds order number and the email address used at checkout. Guest order lookup requires both. Carrier tracking is only shown when real tracking information is linked to the order.</p></section>
            <section className="hf-panel p-6 sm:p-7"><h2 className="text-xl font-semibold tracking-[-.03em]">Privacy</h2><p className="mt-3 text-sm leading-7 text-black/58">Information used to run the storefront, process orders and provide support is described in the <Link href="/privacy-policy" className="font-semibold text-[var(--hf-brand)] underline underline-offset-3">Privacy policy</Link>.</p></section>
          </div>
        </div>
      </div>
    </main>
  )
}
