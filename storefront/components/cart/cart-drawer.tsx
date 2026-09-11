'use client'

import Image from 'next/image'
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/store/cart'
import { formatMoney } from '@/lib/woocommerce/client'

export function CartDrawer() {
  const { cart, open, loading, setOpen, update, remove } = useCart()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <button className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-label="Close cart" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbfaf7] shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div><p className="text-xs uppercase tracking-[.25em] text-black/45">Housefinds</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Your cart</h2></div>
          <button className="grid size-10 place-items-center rounded-full border border-black/10 bg-white" onClick={() => setOpen(false)}><XMarkIcon className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cart?.items?.length ? <div className="grid h-full place-items-center text-center text-black/55"><div><p className="text-lg font-medium text-black">Your cart is empty.</p><p className="mt-2 text-sm">Find something clever for your home.</p></div></div> : (
            <div className="space-y-6">
              {cart.items.map((item) => <div key={item.key} className="grid grid-cols-[88px_1fr] gap-4">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">{item.images?.[0]?.src && <Image src={item.images[0].src} alt={item.name} fill className="object-cover" />}</div>
                <div className="min-w-0"><div className="flex justify-between gap-3"><div><h3 className="line-clamp-2 font-medium leading-tight">{item.name}</h3>{item.variation?.length > 0 && <p className="mt-1 text-xs text-black/50">{item.variation.map((v) => v.value).join(' · ')}</p>}</div><p className="shrink-0 font-semibold">{formatMoney(item.totals.line_total, item.totals.currency_minor_unit, item.totals.currency_symbol)}</p></div>
                  <div className="mt-4 flex items-center justify-between"><div className="flex items-center rounded-full border border-black/10 bg-white"><button className="grid size-9 place-items-center" onClick={() => void update(item.key, item.quantity - 1)}><MinusIcon className="size-4" /></button><span className="min-w-8 text-center text-sm">{item.quantity}</span><button className="grid size-9 place-items-center" onClick={() => void update(item.key, item.quantity + 1)}><PlusIcon className="size-4" /></button></div><button className="text-xs underline underline-offset-4 text-black/50" onClick={() => void remove(item.key)}>Remove</button></div>
                </div>
              </div>)}
            </div>
          )}
        </div>
        <div className="border-t border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center justify-between text-sm"><span className="text-black/55">Subtotal</span><strong className="text-lg">{cart ? formatMoney(cart.totals.total_items, cart.totals.currency_minor_unit, cart.totals.currency_symbol) : '£0.00'}</strong></div>
          <a href="/checkout" className={`flex h-14 items-center justify-center rounded-full bg-[#355f4a] font-semibold text-white transition hover:bg-[#294b3a] ${!cart?.items?.length || loading ? 'pointer-events-none opacity-50' : ''}`}>Checkout</a>
          <p className="mt-3 text-center text-xs text-black/45">Taxes and delivery calculated at checkout.</p>
        </div>
      </aside>
    </div>
  )
}
