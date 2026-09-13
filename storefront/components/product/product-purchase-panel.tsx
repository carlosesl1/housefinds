'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MinusIcon, PlusIcon, CheckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import type { WooProduct, WooProductAttribute, WooAttributeTerm } from '@/lib/woocommerce/types'
import { useCart } from '@/store/cart'
import { formatProductPrice } from '@/lib/woocommerce/money'

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function selectedTerm(attribute: WooProductAttribute, selectedSlug?: string) {
  return attribute.terms.find((term) => term.slug === selectedSlug || normalize(term.name) === normalize(selectedSlug))
}

function variationSupportsSelection(
  product: WooProduct,
  selections: Record<string, string>,
  attributeOverride?: { name: string; term: WooAttributeTerm },
) {
  if (!product.variations?.length) return true

  const nextSelections = { ...selections }
  if (attributeOverride) nextSelections[attributeOverride.name] = attributeOverride.term.slug

  return product.variations.some((variation) =>
    variation.attributes.every((variationAttribute) => {
      const selected = nextSelections[variationAttribute.name]
      if (!selected || !variationAttribute.value) return true

      const productAttribute = product.attributes.find(
        (attribute) => normalize(attribute.name) === normalize(variationAttribute.name),
      )
      const term = productAttribute ? selectedTerm(productAttribute, selected) : undefined
      const candidates = [selected, term?.slug, term?.name].filter(Boolean).map((value) => normalize(String(value)))
      return candidates.includes(normalize(variationAttribute.value))
    }),
  )
}

function findVariationId(product: WooProduct, selections: Record<string, string>) {
  if (!product.variations?.length) return product.id

  const match = product.variations.find((variation) =>
    variation.attributes.every((variationAttribute) => {
      if (!variationAttribute.value) return true
      const productAttribute = product.attributes.find(
        (attribute) => normalize(attribute.name) === normalize(variationAttribute.name),
      )
      if (!productAttribute) return false
      const term = selectedTerm(productAttribute, selections[productAttribute.name])
      if (!term) return false
      return [term.slug, term.name].map(normalize).includes(normalize(variationAttribute.value))
    }),
  )

  return match?.id || null
}

export function ProductPurchasePanel({ product, dark = false }: { product: WooProduct; dark?: boolean }) {
  const variableAttributes = useMemo(
    () => product.attributes.filter((attribute) => attribute.has_variations && attribute.terms.length > 0),
    [product.attributes],
  )

  const initialSelections = useMemo(() => {
    const defaults: Record<string, string> = {}
    variableAttributes.forEach((attribute) => {
      const defaultTerm = attribute.terms.find((term) => term.default) || (attribute.terms.length === 1 ? attribute.terms[0] : undefined)
      if (defaultTerm) defaults[attribute.name] = defaultTerm.slug
    })
    return defaults
  }, [variableAttributes])

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections)
  const [quantity, setQuantity] = useState(Math.max(1, product.add_to_cart?.minimum || 1))
  const add = useCart((state) => state.add)
  const loading = useCart((state) => state.loading)

  const allSelected = variableAttributes.every((attribute) => Boolean(selections[attribute.name]))
  const variationId = allSelected ? findVariationId(product, selections) : null
  const selectionIsValid = !variableAttributes.length || Boolean(variationId) || !product.variations?.length

  const variationPayload = variableAttributes.flatMap((attribute) => {
    const term = selectedTerm(attribute, selections[attribute.name])
    if (!term) return []
    return [{
      attribute: attribute.taxonomy || attribute.name,
      value: attribute.taxonomy ? term.slug : term.name,
    }]
  })

  const selectionSummary = variableAttributes
    .flatMap((attribute) => {
      const term = selectedTerm(attribute, selections[attribute.name])
      return term ? [term.name] : []
    })
    .join(' · ')

  const minimum = Math.max(1, product.add_to_cart?.minimum || 1)
  const maximum = product.add_to_cart?.maximum && product.add_to_cart.maximum > 0 ? product.add_to_cart.maximum : 99
  const step = product.add_to_cart?.multiple_of && product.add_to_cart.multiple_of > 0 ? product.add_to_cart.multiple_of : 1
  const canAdd = product.is_purchasable && product.is_in_stock && allSelected && selectionIsValid && !loading

  const labelClass = dark ? 'text-white/62' : 'text-black/52'
  const optionIdle = dark ? 'border-white/15 bg-white/[.04] text-white/78 hover:bg-white/[.08]' : 'border-black/10 bg-white text-black/68 hover:border-black/20'
  const optionActive = dark ? 'border-[#a8c6b0] bg-[#dce8df] text-[#172018]' : 'border-[#557562] bg-[#e4ede7] text-[#294b3a]'

  async function handleAdd() {
    if (!canAdd) return
    await add(variationId || product.id, quantity, variationPayload)
  }

  function handleStickyAction() {
    if (variableAttributes.length && !allSelected) {
      document.getElementById('purchase-options')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    void handleAdd()
  }

  return (
    <div className="space-y-7" id="purchase-panel">
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className={`text-sm font-medium ${labelClass}`}>Price</p>
          {product.on_sale && <span className="rounded-full bg-[#e5eee7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#355f4a]">Sale</span>}
        </div>
        <p className="mt-1 text-3xl font-semibold tracking-[-.04em]">{formatProductPrice(product)}</p>
        <p className={`mt-2 text-xs leading-5 ${labelClass}`}>Delivery options and final totals are shown before payment.</p>
      </div>

      <div id="purchase-options" className="space-y-6 scroll-mt-32">
        {variableAttributes.map((attribute) => (
          <div key={attribute.name}>
            <div className="flex items-center justify-between gap-4">
              <label className={`text-sm font-semibold ${dark ? 'text-white/86' : 'text-[#172018]'}`}>{attribute.name}</label>
              {!selections[attribute.name] && <span className={`text-xs ${labelClass}`}>Choose one</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {attribute.terms.map((term) => {
                const active = selections[attribute.name] === term.slug
                const available = variationSupportsSelection(product, selections, { name: attribute.name, term })
                return (
                  <button
                    key={`${attribute.name}-${term.slug}`}
                    type="button"
                    disabled={!available}
                    aria-pressed={active}
                    onClick={() => setSelections((current) => ({ ...current, [attribute.name]: term.slug }))}
                    className={`relative min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}
                  >
                    {active && <CheckIcon className="mr-1.5 inline size-4" />}
                    {term.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {allSelected && !selectionIsValid && (
        <p className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          This combination is currently unavailable. Try another option.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className={`flex h-14 w-fit items-center rounded-full border ${dark ? 'border-white/15 bg-white/[.05]' : 'border-black/10 bg-white'}`}>
          <button
            type="button"
            className="grid size-12 place-items-center disabled:opacity-35"
            disabled={quantity <= minimum}
            onClick={() => setQuantity((value) => Math.max(minimum, value - step))}
            aria-label="Decrease quantity"
          >
            <MinusIcon className="size-4" />
          </button>
          <span className="min-w-9 text-center text-sm font-semibold" aria-label={`Quantity ${quantity}`}>{quantity}</span>
          <button
            type="button"
            className="grid size-12 place-items-center disabled:opacity-35"
            disabled={quantity >= maximum}
            onClick={() => setQuantity((value) => Math.min(maximum, value + step))}
            aria-label="Increase quantity"
          >
            <PlusIcon className="size-4" />
          </button>
        </div>

        <button
          type="button"
          disabled={!canAdd}
          onClick={() => void handleAdd()}
          className={`h-14 rounded-full px-7 font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${dark ? 'bg-[#dce8df] text-[#172018] hover:bg-white' : 'bg-[#355f4a] text-white hover:bg-[#294b3a]'}`}
        >
          {loading ? 'Adding…' : !product.is_in_stock ? 'Out of stock' : variableAttributes.length && !allSelected ? 'Choose options' : 'Add to cart'}
        </button>
      </div>

      <div className={`grid gap-2.5 border-t pt-5 text-sm ${dark ? 'border-white/10' : 'border-black/[.07]'} ${labelClass}`}>
        <span>✓ Secure checkout with Stripe</span>
        <Link href="/returns" className="transition hover:underline">✓ 14-day return request window</Link>
        <Link href="/shipping" className="transition hover:underline">✓ Delivery methods shown before payment</Link>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#fbfaf7]/96 p-3 shadow-[0_-16px_50px_rgba(20,30,24,.10)] backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#172018]">{formatProductPrice(product)}</p>
            <p className="truncate text-[11px] text-black/42">{selectionSummary || (variableAttributes.length ? 'Choose product options' : 'Ready to add')}</p>
          </div>
          <button
            type="button"
            disabled={!product.is_purchasable || !product.is_in_stock || loading || (allSelected && !selectionIsValid)}
            onClick={handleStickyAction}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#355f4a] px-5 text-sm font-semibold text-white disabled:opacity-45"
          >
            <ShoppingBagIcon className="size-4" />
            {loading ? 'Adding…' : variableAttributes.length && !allSelected ? 'Choose options' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
