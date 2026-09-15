import Image from 'next/image'
import Link from 'next/link'
import { CheckCircleIcon, ClockIcon, EnvelopeIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { formatMoney } from '@/lib/woocommerce/money'
import { getLastStoreOrder, orderStatusCopy } from '@/lib/woocommerce/order-session'
import { isOperationalAttributeName } from '@/lib/storefront/catalog'
import { PurchaseTracker } from '@/components/analytics/purchase-tracker'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Order confirmation', robots: { index: false, follow: false } }

function maskedEmail(email?: string) {
  if (!email || !email.includes('@')) return ''
  const [name, domain] = email.split('@')
  return `${name.slice(0, Math.min(3, name.length))}${name.length > 3 ? '•••' : ''}@${domain}`
}

export default async function OrderConfirmationPage() {
  const { session, order } = await getLastStoreOrder()

  if (!session || !order) {
    return (
      <main className="min-h-[72vh] bg-[#fbfaf7] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white p-8 text-center shadow-[0_22px_80px_rgba(34,45,37,.05)] sm:p-12">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#557562]">Housefinds order</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-.06em]">We can’t restore this receipt here.</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-black/50">If you have already placed an order, use order tracking from the same browser or contact Housefinds with your order number and email address.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/track-order" className="hf-button-primary">Track an order</Link>
            <a href="mailto:contact@housefindsstore.com" className="hf-button-secondary">Contact support</a>
          </div>
        </div>
      </main>
    )
  }

  const status = orderStatusCopy(order.status)
  const total = order.totals?.total_price
    ? formatMoney(order.totals.total_price, order.totals.currency_minor_unit ?? 2, order.totals.currency_symbol || '£')
    : null
  const showDeliveryEstimate = !['failed', 'cancelled', 'refunded'].includes(order.status)
  const shipping = order.shipping_address || {}
  const email = order.billing_address?.email || session.billing_email
  const orderNumber = order.order_number || session.order_number || String(order.id)

  return (
    <main className="bg-[var(--hf-surface-soft)] px-5 py-10 lg:px-8 lg:py-16">
      {order.totals?.total_price && <PurchaseTracker transactionId={String(orderNumber)} total={order.totals.total_price} currency={order.totals.currency_code || 'GBP'} minorUnit={order.totals.currency_minor_unit ?? 2} items={(order.items || []).map((item) => ({ id: item.id, name: displayProductName(item.name), quantity: item.quantity, lineTotal: item.totals?.line_total }))} />}
      <div className="mx-auto max-w-[1180px]">
        <section className="overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white shadow-[0_28px_100px_rgba(34,45,37,.055)]">
          <div className="bg-[#172018] px-7 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
            <span className="grid size-14 place-items-center rounded-full bg-[#dce8df] text-[#355f4a]"><CheckCircleIcon className="size-8" /></span>
            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.28em] text-white/42">Order #{orderNumber}</p>
            <h1 className="mt-3 max-w-4xl text-[clamp(3.4rem,6vw,6.8rem)] font-semibold leading-[.9] tracking-[-.065em]">{status.label}.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">{status.detail}</p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <div className="grid gap-4 sm:grid-cols-2">
                {showDeliveryEstimate && (
                  <div className="rounded-[var(--hf-radius-md)] bg-[#edf3ee] p-6">
                    <ClockIcon className="size-5 text-[#456b55]" />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[.16em] text-black/38">Estimated delivery</p>
                    <p className="mt-1 text-xl font-semibold tracking-[-.03em]">Around 14 days</p>
                    <p className="mt-2 text-xs leading-5 text-black/42">This is the current standard UK delivery estimate, not a guaranteed arrival date.</p>
                  </div>
                )}
                <div className="rounded-[var(--hf-radius-md)] bg-[#f3f1eb] p-6">
                  <EnvelopeIcon className="size-5 text-[#557562]" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[.16em] text-black/38">Confirmation</p>
                  <p className="mt-1 text-xl font-semibold tracking-[-.03em]">Email sent</p>
                  <p className="mt-2 text-xs leading-5 text-black/42">Keep your confirmation at {maskedEmail(email)} for the order reference and updates.</p>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-[-.04em]">Your order</h2>{total && <strong className="text-xl">{total}</strong>}</div>
                <div className="mt-5 divide-y divide-black/[.07] border-y border-black/[.07]">
                  {(order.items || []).map((item, index) => {
                    const image = item.images?.[0]
                    const variationDetails = (item.variation || [])
                      .filter((entry) => !isOperationalAttributeName(String(entry.attribute || '')))
                      .map((entry) => entry.value)
                      .filter(Boolean)
                    const itemDataDetails = (item.item_data || [])
                      .filter((entry) => !isOperationalAttributeName(String(entry.display_key || entry.key || '')))
                      .map((entry) => entry.display_value || entry.value)
                      .filter(Boolean)
                    const details = variationDetails.length ? variationDetails : itemDataDetails
                    return (
                      <div key={item.key || `${item.id}-${index}`} className="grid grid-cols-[78px_1fr_auto] gap-4 py-5">
                        <div className="relative aspect-square overflow-hidden rounded-[var(--hf-radius-sm)] bg-[#efeee8]">{image?.src && <Image src={image.src} alt={displayProductName(item.name)} fill sizes="78px" className="object-cover" />}</div>
                        <div className="min-w-0 self-center"><p className="font-semibold leading-5">{displayProductName(item.name)}</p>{details.length > 0 && <p className="mt-1 text-xs text-black/42">{details.join(' · ')}</p>}<p className="mt-1 text-xs text-black/38">Qty {item.quantity}</p></div>
                        {item.totals?.line_total && <p className="self-center text-sm font-semibold">{formatMoney(item.totals.line_total, item.totals.currency_minor_unit ?? order.totals?.currency_minor_unit ?? 2, item.totals.currency_symbol || order.totals?.currency_symbol || '£')}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <aside className="border-t border-black/[.06] bg-[#faf9f5] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div>
                <TruckIcon className="size-6 text-[#557562]" />
                <h2 className="mt-4 text-2xl font-semibold tracking-[-.04em]">What happens next</h2>
                <ol className="mt-6 space-y-5 text-sm leading-6 text-black/52">
                  <li><strong className="block text-[#172018]">1. We prepare your order</strong>Housefinds prepares your order for dispatch.</li>
                  <li><strong className="block text-[#172018]">2. Dispatch update</strong>When shipment information becomes available, your order tracking can be updated.</li>
                  <li><strong className="block text-[#172018]">3. Delivery</strong>Standard UK delivery is free and currently estimated at around 14 days.</li>
                </ol>
              </div>

              {(shipping.address_1 || shipping.city || shipping.postcode) && (
                <div className="mt-9 border-t border-black/[.07] pt-8">
                  <MapPinIcon className="size-5 text-[#557562]" />
                  <h3 className="mt-3 font-semibold">Delivery address</h3>
                  <p className="mt-2 text-sm leading-6 text-black/48">{[shipping.first_name && shipping.last_name ? `${shipping.first_name} ${shipping.last_name}` : shipping.first_name, shipping.address_1, shipping.address_2, shipping.city, shipping.postcode, shipping.country === 'GB' ? 'United Kingdom' : shipping.country].filter(Boolean).join(', ')}</p>
                </div>
              )}

              <div className="mt-9 grid gap-3 border-t border-black/[.07] pt-8">
                <Link href="/track-order" className="hf-button-primary">Track this order</Link>
                <Link href="/shop" className="hf-button-secondary">Continue shopping</Link>
                <p className="text-center text-xs leading-5 text-black/38">Need help? <a className="underline underline-offset-3" href="mailto:contact@housefindsstore.com">contact@housefindsstore.com</a></p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
