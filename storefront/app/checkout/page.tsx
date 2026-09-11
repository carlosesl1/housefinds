'use client'

import { useCart } from '@/store/cart'

export default function CheckoutPage() {
  const cart = useCart((s) => s.cart)

  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <section>
          <p className="text-xs uppercase tracking-[.28em] text-black/45">Secure checkout</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em]">Checkout</h1>

          <div className="mt-10 space-y-8">
            <div>
              <h2 className="text-lg font-semibold">1. Contact</h2>
              <input className="mt-3 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 outline-none" placeholder="Email address" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">2. Delivery</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input className="h-12 rounded-2xl border border-black/10 bg-white px-4 outline-none" placeholder="First name" />
                <input className="h-12 rounded-2xl border border-black/10 bg-white px-4 outline-none" placeholder="Last name" />
                <input className="h-12 rounded-2xl border border-black/10 bg-white px-4 outline-none sm:col-span-2" placeholder="Address" />
                <input className="h-12 rounded-2xl border border-black/10 bg-white px-4 outline-none" placeholder="City" />
                <input className="h-12 rounded-2xl border border-black/10 bg-white px-4 outline-none" placeholder="Postcode" />
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-black/15 p-6 text-sm text-black/50">
              <strong className="text-black">Payment integration is the next milestone.</strong>
              <p className="mt-2">This screen is ready for WooCommerce checkout + the selected UK payment gateway once we validate its Store API flow.</p>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-5 space-y-4">
            {cart?.items?.map((item) => (
              <div key={item.key} className="flex justify-between gap-4 text-sm">
                <span>{item.quantity} × {item.name}</span>
                <span>{item.totals.line_total}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
