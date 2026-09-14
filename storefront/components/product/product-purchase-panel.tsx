'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MinusIcon, PlusIcon, CheckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import type { WooProductAttribute, WooAttributeTerm } from '@/lib/woocommerce/types'
import type { PurchaseProduct, PurchaseVariation } from '@/lib/storefront/client-product'
import { storefrontAttributeName, storefrontTermName } from '@/lib/storefront/catalog'
import { useCart } from '@/store/cart'
import { formatProductPrice } from '@/lib/woocommerce/money'

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function selectedTerm(attribute: WooProductAttribute, selectedSlug?: string) {
  return attribute.terms.find((term) => term.slug === selectedSlug || normalize(term.name) === normalize(selectedSlug))
}

function variationSupportsSelection(product: PurchaseProduct, selections: Record<string, string>, attributeOverride?: { name: string; term: WooAttributeTerm }) {
  if (!product.variations?.length) return true
  const nextSelections = { ...selections }
  if (attributeOverride) nextSelections[attributeOverride.name] = attributeOverride.term.slug
  return product.variations.some((variation) =>
    variation.attributes.every((variationAttribute) => {
      const selected = nextSelections[variationAttribute.name]
      if (!selected || !variationAttribute.value) return true
      const productAttribute = product.attributes.find((attribute) => normalize(attribute.name) === normalize(variationAttribute.name))
      const term = productAttribute ? selectedTerm(productAttribute, selected) : undefined
      const candidates = [selected, term?.slug, term?.name].filter(Boolean).map((value) => normalize(String(value)))
      return candidates.includes(normalize(variationAttribute.value))
    }),
  )
}

function findVariationId(product: PurchaseProduct, selections: Record<string, string>) {
  if (!product.variations?.length) return product.id
  const match = product.variations.find((variation) =>
    variation.attributes.every((variationAttribute) => {
      if (!variationAttribute.value) return true
      const productAttribute = product.attributes.find((attribute) => normalize(attribute.name) === normalize(variationAttribute.name))
      if (!productAttribute) return false
      const term = selectedTerm(productAttribute, selections[productAttribute.name])
      if (!term) return false
      return [term.slug, term.name].map(normalize).includes(normalize(variationAttribute.value))
    }),
  )
  return match?.id || null
}

type CompoundDimension = 'pack' | 'capacity' | 'colour'
type CompoundChoice = Partial<Record<CompoundDimension, string>>
type ParsedCompoundTerm = {
  term: WooAttributeTerm
  pack: string
  capacity: string
  colour: string
}

function parseCompoundTerm(term: WooAttributeTerm): ParsedCompoundTerm | null {
  const raw = term.name.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
  const capacityMatch = raw.match(/\b(\d+(?:\.\d+)?)\s*(ml|l)\b/i)
  if (!capacityMatch) return null

  const packMatch = raw.match(/\b(\d+)\s*pcs?\b/i)
  const capacity = `${capacityMatch[1]}${capacityMatch[2].toLowerCase()}`
  const colour = raw
    .replace(/\b\d+\s*pcs?\b/i, ' ')
    .replace(capacityMatch[0], ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '+')

  if (!colour) return null

  return {
    term,
    pack: packMatch ? `${packMatch[1]}-pack` : 'standard',
    capacity,
    colour,
  }
}

function compoundTerms(attribute: WooProductAttribute): ParsedCompoundTerm[] | null {
  const parsed = attribute.terms.map(parseCompoundTerm)
  if (parsed.some((entry) => !entry)) return null

  const terms = parsed.filter((entry): entry is ParsedCompoundTerm => Boolean(entry))
  const packValues = new Set(terms.map((entry) => entry.pack))
  const capacityValues = new Set(terms.map((entry) => entry.capacity))
  const colourValues = new Set(terms.map((entry) => entry.colour))

  // Only decompose supplier values when they clearly contain several choices.
  if (packValues.size < 2 || capacityValues.size < 2 || colourValues.size < 2) return null
  return terms
}

function dimensionLabel(dimension: CompoundDimension) {
  if (dimension === 'pack') return 'Set'
  if (dimension === 'capacity') return 'Capacity'
  return 'Colour'
}

function dimensionValueLabel(dimension: CompoundDimension, value: string) {
  if (dimension === 'pack') return value === 'standard' ? 'Standard' : value.replace('-', ' ')
  if (dimension === 'capacity') return value
  return value
    .split('+')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' + ')
}

function matchesCompoundChoice(entry: ParsedCompoundTerm, choice: CompoundChoice) {
  return (Object.keys(choice) as CompoundDimension[]).every((dimension) => !choice[dimension] || entry[dimension] === choice[dimension])
}

export function ProductPurchasePanel({ product, variations = [], dark = false }: { product: PurchaseProduct; variations?: PurchaseVariation[]; dark?: boolean }) {
  const variableAttributes = useMemo(() => product.attributes.filter((attribute) => attribute.has_variations && attribute.terms.length > 0), [product.attributes])

  const initialSelections = useMemo(() => {
    const defaults: Record<string, string> = {}
    variableAttributes.forEach((attribute) => {
      const defaultTerm = attribute.terms.find((term) => term.default)
        || (attribute.terms.length === 1 ? attribute.terms[0] : undefined)
      if (defaultTerm) defaults[attribute.name] = defaultTerm.slug
    })
    return defaults
  }, [variableAttributes])

  const compoundConfigs = useMemo(() => {
    const configs = new Map<string, ParsedCompoundTerm[]>()
    variableAttributes.forEach((attribute) => {
      const parsed = compoundTerms(attribute)
      if (parsed) configs.set(attribute.name, parsed)
    })
    return configs
  }, [variableAttributes])

  const initialCompoundSelections = useMemo(() => {
    const result: Record<string, CompoundChoice> = {}
    compoundConfigs.forEach((entries, attributeName) => {
      const selected = entries.find((entry) => entry.term.slug === initialSelections[attributeName])
      if (selected) result[attributeName] = { pack: selected.pack, capacity: selected.capacity, colour: selected.colour }
    })
    return result
  }, [compoundConfigs, initialSelections])

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections)
  const [compoundSelections, setCompoundSelections] = useState<Record<string, CompoundChoice>>(initialCompoundSelections)
  const [quantity, setQuantity] = useState(Math.max(1, product.add_to_cart?.minimum || 1))
  const add = useCart((state) => state.add)
  const loading = useCart((state) => state.loading)

  const allSelected = variableAttributes.every((attribute) => Boolean(selections[attribute.name]))
  const variationId = allSelected ? findVariationId(product, selections) : null
  const selectedVariation = variationId ? variations.find((variation) => variation.id === variationId) : undefined
  const selectionIsValid = !variableAttributes.length || Boolean(variationId) || !product.variations?.length
  const exactProduct = selectedVariation || product
  const exactAvailabilityKnown = !variableAttributes.length || Boolean(selectedVariation) || !variations.length
  const isPurchasable = exactAvailabilityKnown ? exactProduct.is_purchasable : product.is_purchasable
  const isInStock = exactAvailabilityKnown ? exactProduct.is_in_stock : product.is_in_stock

  const selectionSummary = variableAttributes.flatMap((attribute) => {
    const term = selectedTerm(attribute, selections[attribute.name])
    return term ? [storefrontTermName(term)] : []
  }).join(' · ')

  const cartRules = selectedVariation?.add_to_cart || product.add_to_cart
  const minimum = Math.max(1, cartRules?.minimum || 1)
  const maximum = cartRules?.maximum && cartRules.maximum > 0 ? cartRules.maximum : 99
  const step = cartRules?.multiple_of && cartRules.multiple_of > 0 ? cartRules.multiple_of : 1
  const canAdd = isPurchasable && isInStock && allSelected && selectionIsValid && !loading
  const displayPrice = formatProductPrice(exactProduct)

  const labelClass = dark ? 'text-white/62' : 'text-black/52'
  const optionIdle = dark ? 'border-white/15 bg-white/[.04] text-white/78 hover:bg-white/[.08]' : 'border-black/10 bg-white text-black/68 hover:border-black/20'
  const optionActive = dark ? 'border-[#a8c6b0] bg-[#dce8df] text-[#172018]' : 'border-[#557562] bg-[#e4ede7] text-[#294b3a]'

  async function handleAdd() {
    if (!canAdd) return
    await add(variationId || product.id, quantity)
  }

  function handleStickyAction() {
    if (variableAttributes.length && !allSelected) {
      document.getElementById('purchase-options')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    void handleAdd()
  }

  function compoundOptionAvailable(attribute: WooProductAttribute, dimension: CompoundDimension, value: string) {
    const entries = compoundConfigs.get(attribute.name)
    if (!entries) return false
    const current = compoundSelections[attribute.name] || {}
    const nextChoice = { ...current, [dimension]: value }
    const baseSelections = { ...selections }
    delete baseSelections[attribute.name]

    return entries.some((entry) =>
      matchesCompoundChoice(entry, nextChoice)
      && variationSupportsSelection(product, baseSelections, { name: attribute.name, term: entry.term }),
    )
  }

  function chooseCompoundOption(attribute: WooProductAttribute, dimension: CompoundDimension, value: string) {
    const entries = compoundConfigs.get(attribute.name)
    if (!entries) return

    const nextChoice: CompoundChoice = { ...(compoundSelections[attribute.name] || {}), [dimension]: value }
    setCompoundSelections((current) => ({ ...current, [attribute.name]: nextChoice }))

    const baseSelections = { ...selections }
    delete baseSelections[attribute.name]
    const matching = entries.filter((entry) =>
      matchesCompoundChoice(entry, nextChoice)
      && variationSupportsSelection(product, baseSelections, { name: attribute.name, term: entry.term }),
    )
    const complete = Boolean(nextChoice.pack && nextChoice.capacity && nextChoice.colour)

    setSelections((current) => {
      const next = { ...current }
      if (complete && matching.length === 1) next[attribute.name] = matching[0].term.slug
      else delete next[attribute.name]
      return next
    })
  }

  return (
    <div className="space-y-7" id="purchase-panel">
      <div aria-live="polite">
        <p className={`text-sm font-medium ${labelClass}`}>{selectedVariation ? 'Selected price' : 'Price'}</p>
        <p className="mt-1 text-3xl font-semibold tracking-[-.04em]">{displayPrice}</p>
        {allSelected && variations.length > 0 && !selectedVariation && <p className="mt-2 text-xs font-medium text-amber-700">Select another combination to see exact availability.</p>}
        {selectedVariation && !selectedVariation.is_in_stock && <p className="mt-2 text-xs font-semibold text-rose-700">This option is currently out of stock.</p>}
        {selectedVariation?.is_in_stock && <p className={`mt-2 text-xs font-medium ${dark ? 'text-[#a8c6b0]' : 'text-[#456b55]'}`}>Selected option is in stock.</p>}
        <p className={`mt-2 text-xs leading-5 ${labelClass}`}>Free UK delivery · current estimate around 14 days.</p>
      </div>

      {variableAttributes.length > 0 && (
        <div id="purchase-options" className="space-y-6 scroll-mt-32">
          {variableAttributes.map((attribute) => {
            const compound = compoundConfigs.get(attribute.name)

            if (compound) {
              const current = compoundSelections[attribute.name] || {}
              const dimensions: CompoundDimension[] = ['pack', 'capacity', 'colour']
              return (
                <div key={attribute.name} className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm font-semibold ${dark ? 'text-white/86' : 'text-[#172018]'}`}>Choose your option</p>
                    {!selections[attribute.name] && <span className={`text-xs ${labelClass}`}>3 quick choices</span>}
                  </div>

                  {dimensions.map((dimension) => {
                    const values = Array.from(new Set(compound.map((entry) => entry[dimension])))
                    return (
                      <div key={`${attribute.name}-${dimension}`}>
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-xs font-semibold uppercase tracking-[.13em] ${labelClass}`}>{dimensionLabel(dimension)}</span>
                          {current[dimension] && <span className={`text-xs ${labelClass}`}>{dimensionValueLabel(dimension, current[dimension]!)}</span>}
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2.5">
                          {values.map((value) => {
                            const active = current[dimension] === value
                            const available = compoundOptionAvailable(attribute, dimension, value)
                            return (
                              <button
                                key={`${attribute.name}-${dimension}-${value}`}
                                type="button"
                                disabled={!available}
                                aria-pressed={active}
                                onClick={() => chooseCompoundOption(attribute, dimension, value)}
                                className={`relative min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}
                              >
                                {active && <CheckIcon className="mr-1.5 inline size-4" />}{dimensionValueLabel(dimension, value)}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }

            return (
              <div key={attribute.name}>
                <div className="flex items-center justify-between gap-4">
                  <label className={`text-sm font-semibold ${dark ? 'text-white/86' : 'text-[#172018]'}`}>{storefrontAttributeName(attribute)}</label>
                  {!selections[attribute.name] && <span className={`text-xs ${labelClass}`}>Choose one</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {attribute.terms.map((term) => {
                    const active = selections[attribute.name] === term.slug
                    const available = variationSupportsSelection(product, selections, { name: attribute.name, term })
                    return (
                      <button key={`${attribute.name}-${term.slug}`} type="button" disabled={!available} aria-pressed={active} onClick={() => setSelections((currentSelections) => ({ ...currentSelections, [attribute.name]: term.slug }))} className={`relative min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}>
                        {active && <CheckIcon className="mr-1.5 inline size-4" />}{storefrontTermName(term)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {allSelected && !selectionIsValid && <p className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">This combination is currently unavailable. Try another option.</p>}

      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className={`flex h-14 w-fit items-center rounded-full border ${dark ? 'border-white/15 bg-white/[.05]' : 'border-black/10 bg-white'}`}>
          <button type="button" className="grid size-12 place-items-center disabled:opacity-35" disabled={quantity <= minimum} onClick={() => setQuantity((value) => Math.max(minimum, value - step))} aria-label="Decrease quantity"><MinusIcon className="size-4" /></button>
          <span className="min-w-9 text-center text-sm font-semibold" aria-label={`Quantity ${quantity}`}>{quantity}</span>
          <button type="button" className="grid size-12 place-items-center disabled:opacity-35" disabled={quantity >= maximum} onClick={() => setQuantity((value) => Math.min(maximum, value + step))} aria-label="Increase quantity"><PlusIcon className="size-4" /></button>
        </div>

        <button type="button" disabled={!canAdd} onClick={() => void handleAdd()} className={`h-14 rounded-full px-7 font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${dark ? 'bg-[#dce8df] text-[#172018] hover:bg-white' : 'bg-[#355f4a] text-white hover:bg-[#294b3a]'}`}>
          {loading ? 'Adding…' : !isInStock ? 'Out of stock' : variableAttributes.length && !allSelected ? 'Choose options' : 'Add to cart'}
        </button>
      </div>

      <div className={`grid gap-2.5 border-t pt-5 text-sm ${dark ? 'border-white/10' : 'border-black/[.07]'} ${labelClass}`}>
        <span>✓ Free standard UK delivery</span>
        <Link href="/returns" className="transition hover:underline">✓ Free 14-day returns on eligible online orders</Link>
        <Link href="/returns" className="transition hover:underline">✓ Damaged or faulty? Refund or replacement where appropriate</Link>
        <span>✓ Card payment securely processed by Stripe</span>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#fbfaf7]/96 p-3 shadow-[0_-16px_50px_rgba(20,30,24,.10)] backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#172018]">{displayPrice}</p><p className="truncate text-[11px] text-black/42">{selectionSummary || (variableAttributes.length ? 'Choose product options' : 'Free UK delivery')}</p></div>
          <button type="button" disabled={!isPurchasable || !isInStock || loading || (allSelected && !selectionIsValid)} onClick={handleStickyAction} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#355f4a] px-5 text-sm font-semibold text-white disabled:opacity-45"><ShoppingBagIcon className="size-4" />{loading ? 'Adding…' : variableAttributes.length && !allSelected ? 'Choose options' : !isInStock ? 'Out of stock' : 'Add to cart'}</button>
        </div>
      </div>
    </div>
  )
}
