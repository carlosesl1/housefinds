import Link from 'next/link'
import { CheckCircleIcon, ClockIcon, EnvelopeIcon, TruckIcon } from '@heroicons/react/24/outline'
import { OrderLookupForm } from '@/components/order/order-lookup-form'
import { getLastStoreOrder, orderStatusCopy } from '@/lib/woocommerce/order-session'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Track your order',
  description: 'Check the latest Housefinds order status and shipment tracking information.',
  robots: { index: false, follow: false },
}

export default async function TrackOrderPage() {
  const { session, order } = await getLastStoreOrder()
  const status = order ? orderStatusCopy(order.status) : null
  const orderNumber = order ? order.order_number || session?.order_number || String(order.id) : null
  const activePreparing = Boolean(order && ['processing', 'on-hold', 'completed'].includes(order.status))
  const showDeliveryEstimate = Boolean(order && !['failed', 'cancelled', 'refunded'].includes(order.status))

  return (
    <main className="bg-[var(--hf-background)] px-5 py-12 lg:px-8 lg:py-18">
      <div className="mx-auto max-w-[1120px]">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[var(--hf-brand-muted)]">Order tracking</p>
          <h1 className="mt-4 text-[clamp(3.8rem,6vw,6.8rem)] font-semibold leading-[.88] tracking-[-.065em]">Know what happens<br /><span className="text-[var(--hf-brand-muted)]">after checkout.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/50">Check your Housefinds order status here. Carrier details appear when shipment information is linked to the order.</p>
        </div>

        {order && session && status && (
          <section className="mt-12 overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white shadow-[0_22px_80px_rgba(34,45,37,.045)]">
            <div className="flex flex-col justify-between gap-5 bg-[#172018] p-7 text-white sm:flex-row sm:items-end sm:p-9">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-white/40">Your most recent order · #{orderNumber}</p>
                <h2 className="mt-2 text-4xl font-semibold tracking-[-.05em]">{status.label}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{status.detail}</p>
              </div>
              {showDeliveryEstimate && <div className="shrink-0 rounded-2xl bg-white/[.07] px-5 py-4"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/35">Current estimate</p><p className="mt-1 font-semibold">Around 14 days</p><p className="mt-1 text-[11px] leading-4 text-white/40">Not a guaranteed arrival date.</p></div>}
            </div>

            <div className="p-7 sm:p-9">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#b8cdbf] bg-[#edf3ee] p-5"><span className="grid size-9 place-items-center rounded-full bg-[var(--hf-brand)] text-white"><CheckCircleIcon className="size-5" /></span><p className="mt-4 font-semibold">Order received</p><p className="mt-1 text-xs leading-5 text-black/42">Your order has been created in Housefinds.</p></div>
                <div className={`rounded-2xl border p-5 ${activePreparing ? 'border-[#b8cdbf] bg-[#edf3ee]' : 'border-black/[.07] bg-[#faf9f6]'}`}><span className={`grid size-9 place-items-center rounded-full ${activePreparing ? 'bg-[var(--hf-brand)] text-white' : 'bg-black/[.05] text-black/30'}`}>{activePreparing ? <CheckCircleIcon className="size-5" /> : <ClockIcon className="size-5" />}</span><p className="mt-4 font-semibold">Preparing your order</p><p className="mt-1 text-xs leading-5 text-black/42">Payment and order details are confirmed before dispatch.</p></div>
                <div className="rounded-2xl border border-black/[.07] bg-[#faf9f6] p-5"><span className="grid size-9 place-items-center rounded-full bg-black/[.05] text-black/30"><TruckIcon className="size-5" /></span><p className="mt-4 font-semibold">Shipment tracking</p><p className="mt-1 text-xs leading-5 text-black/42">Carrier tracking will appear once it is linked to the order.</p></div>
              </div>

              <div className="mt-7 flex flex-col justify-between gap-4 border-t border-black/[.07] pt-6 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3 text-sm text-black/48"><EnvelopeIcon className="mt-0.5 size-5 shrink-0 text-[var(--hf-brand-muted)]" /><p>This browser remembers the latest order securely for easier tracking. Keep your order confirmation email as a backup.</p></div>
                <Link href="/order-confirmation" className="shrink-0 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold">View receipt</Link>
              </div>
            </div>
          </section>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <OrderLookupForm />
          <aside className="h-fit rounded-[30px] bg-[#eef1ec] p-7">
            <h2 className="text-2xl font-semibold tracking-[-.04em]">Need help?</h2>
            <p className="mt-3 text-sm leading-6 text-black/48">If you cannot find an order, send the order number and checkout email to Housefinds support.</p>
            <a href="mailto:contact@housefindsstore.com" className="mt-5 inline-flex text-sm font-semibold text-[var(--hf-brand)] underline underline-offset-4">contact@housefindsstore.com</a>
            <p className="mt-6 border-t border-black/[.07] pt-5 text-xs leading-5 text-black/38">Standard UK delivery is free. The current delivery estimate is around 14 days and is not a guaranteed arrival date.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
