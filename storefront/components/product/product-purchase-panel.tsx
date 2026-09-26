'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowUturnLeftIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import type { WooProductAttribute, WooAttributeTerm } from '@/lib/woocommerce/types'
import type { PurchaseProduct, PurchaseVariation } from '@/lib/storefront/client-product'
import { storefrontAttributeName, storefrontTermName } from '@/lib/storefront/catalog'
import { colourForceTerms, parseColourForceTerm } from '@/lib/storefront/product-attributes'
import { useCart } from '@/store/cart'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { moneyValue, trackStorefrontEvent } from '@/lib/storefront/analytics'

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

type ColourForceChoice = {
  colour?: string
  force?: string
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

function colourSwatchClass(colour: string) {
  const value = normalize(colour)
  if (value === 'black') return 'bg-[#151816] border-black/15'
  if (value === 'white') return 'bg-white border-black/15'
  if (value.includes('silver') || value.includes('grey') || value.includes('gray')) return 'bg-[#c6cbc8] border-black/10'
  return 'bg-[var(--hf-brand-soft)] border-black/10'
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

  const colourForceConfigs = useMemo(() => {
    const configs = new Map<string, NonNullable<ReturnType<typeof colourForceTerms>>>()
    variableAttributes.forEach((attribute) => {
      const parsed = colourForceTerms(attribute)
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

  const initialColourForceSelections = useMemo(() => {
    const result: Record<string, ColourForceChoice> = {}
    colourForceConfigs.forEach((entries, attributeName) => {
      const selected = entries.find((entry) => entry.term.slug === initialSelections[attributeName])
      if (selected) result[attributeName] = { colour: selected.colour, force: selected.force }
    })
    return result
  }, [colourForceConfigs, initialSelections])

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections)
  const [compoundSelections, setCompoundSelections] = useState<Record<string, CompoundChoice>>(initialCompoundSelections)
  const [colourForceSelections, setColourForceSelections] = useState<Record<string, ColourForceChoice>>(initialColourForceSelections)
  const [quantity, setQuantity] = useState(Math.max(1, product.add_to_cart?.minimum || 1))
  const panelRef = useRef<HTMLDivElement | null>(null)
  const seenPanel = useRef(false)
  const [showSticky, setShowSticky] = useState(false)
  const [mounted, setMounted] = useState(false)
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
    if (!term) return []
    const colourForce = parseColourForceTerm(term)
    return colourForce ? [`${colourForce.colour} · ${colourForce.force}`] : [storefrontTermName(term)]
  }).join(' · ')

  const cartRules = selectedVariation?.add_to_cart || product.add_to_cart
  const minimum = Math.max(1, cartRules?.minimum || 1)
  const maximum = cartRules?.maximum && cartRules.maximum > 0 ? cartRules.maximum : 99
  const step = cartRules?.multiple_of && cartRules.multiple_of > 0 ? cartRules.multiple_of : 1
  const canAdd = isPurchasable && isInStock && allSelected && selectionIsValid && !loading
  const displayPrice = formatProductPrice(exactProduct)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const node = panelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        seenPanel.current = true
        setShowSticky(false)
      } else if (seenPanel.current) {
        setShowSticky(true)
      }
    }, { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!selectedVariation?.image?.src) return
    window.dispatchEvent(new CustomEvent('housefinds:variation-image', { detail: selectedVariation.image }))
  }, [selectedVariation?.id, selectedVariation?.image?.src])

  const labelClass = dark ? 'text-white/62' : 'text-black/52'
  const optionIdle = dark ? 'border-white/15 bg-white/[.04] text-white/78 hover:bg-white/[.08]' : 'border-black/10 bg-white text-black/68 hover:border-[#557562]/45 hover:bg-[#fbfcfa]'
  const optionActive = dark ? 'border-[#a8c6b0] bg-[#dce8df] text-[#172018]' : 'border-[#557562] bg-[#e4ede7] text-[#294b3a] '

  async function handleAdd() {
    if (!canAdd) return
    const added = await add(variationId || product.id, quantity)
    if (!added) return
    trackStorefrontEvent({
      event: 'add_to_cart',
      ecommerce: {
        currency: exactProduct.prices.currency_code || 'GBP',
        value: moneyValue(exactProduct.prices.price, exactProduct.prices.currency_minor_unit) * quantity,
        items: [{
          item_id: String(variationId || product.id),
          item_name: product.name,
          item_variant: selectionSummary || undefined,
          price: moneyValue(exactProduct.prices.price, exactProduct.prices.currency_minor_unit),
          quantity,
        }],
      },
    })
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

  function colourForceOptionAvailable(attribute: WooProductAttribute, dimension: keyof ColourForceChoice, value: string) {
    const entries = colourForceConfigs.get(attribute.name)
    if (!entries) return false
    const current = colourForceSelections[attribute.name] || {}
    const nextChoice = { ...current, [dimension]: value }
    const baseSelections = { ...selections }
    delete baseSelections[attribute.name]

    return entries.some((entry) =>
      (!nextChoice.colour || entry.colour === nextChoice.colour)
      && (!nextChoice.force || entry.force === nextChoice.force)
      && variationSupportsSelection(product, baseSelections, { name: attribute.name, term: entry.term }),
    )
  }

  function chooseColourForceOption(attribute: WooProductAttribute, dimension: keyof ColourForceChoice, value: string) {
    const entries = colourForceConfigs.get(attribute.name)
    if (!entries) return

    const nextChoice: ColourForceChoice = { ...(colourForceSelections[attribute.name] || {}), [dimension]: value }
    setColourForceSelections((current) => ({ ...current, [attribute.name]: nextChoice }))

    const baseSelections = { ...selections }
    delete baseSelections[attribute.name]
    const matching = entries.filter((entry) =>
      (!nextChoice.colour || entry.colour === nextChoice.colour)
      && (!nextChoice.force || entry.force === nextChoice.force)
      && variationSupportsSelection(product, baseSelections, { name: attribute.name, term: entry.term }),
    )
    const complete = Boolean(nextChoice.colour && nextChoice.force)

    setSelections((current) => {
      const next = { ...current }
      if (complete && matching.length === 1) next[attribute.name] = matching[0].term.slug
      else delete next[attribute.name]
      return next
    })
  }

  return (
    <div ref={panelRef} className="space-y-6" id="purchase-panel">
      <div
        aria-live="polite"
        className={`hf-price-block ${dark ? 'text-white' : 'text-[var(--hf-ink)]'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[.16em] ${labelClass}`}>{selectedVariation ? 'Selected price' : 'Price'}</p>
            <p className="mt-1.5 text-[2.15rem] font-semibold leading-none tracking-[-.04em]">{displayPrice}</p>
          </div>
          <span className={`hf-availability ${isInStock ? (dark ? 'text-[#cfe1d3]' : 'text-[var(--hf-brand)]') : (dark ? 'text-white/65' : 'text-[var(--hf-ink-soft)]')}`}>
            {isInStock ? 'Available to order' : 'Out of stock'}
          </span>
        </div>
        {allSelected && variations.length > 0 && !selectedVariation && <p className="mt-3 text-xs font-medium text-amber-700">Select another combination to see exact availability.</p>}
        {selectedVariation && !selectedVariation.is_in_stock && <p className="mt-3 text-xs font-semibold text-rose-700">This option is currently out of stock.</p>}
        {selectionSummary && <p className={`mt-3 text-xs font-medium ${dark ? 'text-white/58' : 'text-black/58'}`}>{selectionSummary}</p>}
        <p className={`mt-3 flex items-center gap-2 text-xs leading-5 ${labelClass}`}><TruckIcon className="size-4 shrink-0" /> Free UK delivery · current estimate around 14 days.</p>
      </div>

      {variableAttributes.length > 0 && (
        <div id="purchase-options" className="space-y-6 scroll-mt-32 border-t border-black/[.07] pt-5">
          {variableAttributes.map((attribute) => {
            const colourForce = colourForceConfigs.get(attribute.name)
            const compound = compoundConfigs.get(attribute.name)

            if (colourForce) {
              const current = colourForceSelections[attribute.name] || {}
              const colours = Array.from(new Set(colourForce.map((entry) => entry.colour)))
              const forces = Array.from(new Map(colourForce.slice().sort((a, b) => a.forceGrams - b.forceGrams).map((entry) => [entry.force, entry])).values()).map((entry) => entry.force)

              return (
                <div key={attribute.name} className="hf-purchase-options-group space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm font-semibold ${dark ? 'text-white/86' : 'text-[#172018]'}`}>Choose your option</p>
                    {!selections[attribute.name] && <span className={`text-xs ${labelClass}`}>Colour + force</span>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-xs font-semibold uppercase tracking-[.11em] ${labelClass}`}>Colour</span>
                      {current.colour && <span className={`text-xs ${labelClass}`}>{current.colour}</span>}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {colours.map((colour) => {
                        const active = current.colour === colour
                        const available = colourForceOptionAvailable(attribute, 'colour', colour)
                        return (
                          <button
                            key={`${attribute.name}-colour-${colour}`}
                            type="button"
                            disabled={!available}
                            aria-pressed={active}
                            onClick={() => chooseColourForceOption(attribute, 'colour', colour)}
                            className={`inline-flex min-h-11 items-center gap-2.5 rounded-[var(--hf-radius-pill)] border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}
                          >
                            <span className={`size-3.5 rounded-full border ${colourSwatchClass(colour)}`} aria-hidden="true" />
                            {colour}
                            {active && <CheckIcon className="size-4" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-xs font-semibold uppercase tracking-[.11em] ${labelClass}`}>Closing force</span>
                      {current.force && <span className={`text-xs ${labelClass}`}>{current.force}</span>}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {forces.map((force) => {
                        const active = current.force === force
                        const available = colourForceOptionAvailable(attribute, 'force', force)
                        return (
                          <button
                            key={`${attribute.name}-force-${force}`}
                            type="button"
                            disabled={!available}
                            aria-pressed={active}
                            onClick={() => chooseColourForceOption(attribute, 'force', force)}
                            className={`min-h-11 rounded-[var(--hf-radius-pill)] border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}
                          >
                            {active && <CheckIcon className="mr-1.5 inline size-4" />}{force}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }

            if (compound) {
              const current = compoundSelections[attribute.name] || {}
              const dimensions: CompoundDimension[] = ['pack', 'capacity', 'colour']
              return (
                <div key={attribute.name} className="hf-purchase-options-group space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm font-semibold ${dark ? 'text-white/86' : 'text-[#172018]'}`}>Choose your option</p>
                    {!selections[attribute.name] && <span className={`text-xs ${labelClass}`}>3 choices</span>}
                  </div>

                  {dimensions.map((dimension) => {
                    const values = Array.from(new Set(compound.map((entry) => entry[dimension])))
                    return (
                      <div key={`${attribute.name}-${dimension}`}>
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-xs font-semibold uppercase tracking-[.11em] ${labelClass}`}>{dimensionLabel(dimension)}</span>
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
                                className={`relative min-h-11 rounded-[var(--hf-radius-pill)] border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}
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
                      <button key={`${attribute.name}-${term.slug}`} type="button" disabled={!available} aria-pressed={active} onClick={() => setSelections((currentSelections) => ({ ...currentSelections, [attribute.name]: term.slug }))} className={`relative min-h-11 rounded-[var(--hf-radius-pill)] border px-4 py-2 text-sm font-medium transition ${active ? optionActive : optionIdle} ${!available ? 'cursor-not-allowed opacity-35 line-through' : ''}`}>
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

      {allSelected && !selectionIsValid && <p className="rounded-[var(--hf-radius-sm)] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">This combination is currently unavailable. Try another option.</p>}

      <div>
        <p className={`mb-2 text-xs font-semibold uppercase tracking-[.12em] ${labelClass}`}>Quantity</p>
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <div className={`flex h-14 w-fit items-center rounded-[var(--hf-radius-pill)] border ${dark ? 'border-white/15 bg-white/[.05]' : 'border-black/10 bg-white'}`}>
            <button type="button" className="grid size-12 place-items-center disabled:opacity-35" disabled={quantity <= minimum} onClick={() => setQuantity((value) => Math.max(minimum, value - step))} aria-label="Decrease quantity"><MinusIcon className="size-4" /></button>
            <span className="min-w-9 text-center text-sm font-semibold" aria-label={`Quantity ${quantity}`}>{quantity}</span>
            <button type="button" className="grid size-12 place-items-center disabled:opacity-35" disabled={quantity >= maximum} onClick={() => setQuantity((value) => Math.min(maximum, value + step))} aria-label="Increase quantity"><PlusIcon className="size-4" /></button>
          </div>

          <button type="button" disabled={!canAdd} onClick={() => void handleAdd()} className={`inline-flex h-14 items-center justify-center gap-2 rounded-[var(--hf-radius-pill)] px-7 font-semibold  transition disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${dark ? 'bg-[#dce8df] text-[#172018] hover:bg-white' : 'bg-[var(--hf-brand)] text-white hover:bg-[var(--hf-brand-hover)]'}`}>
            <ShoppingBagIcon className="size-4.5" />
            {loading ? 'Adding…' : !isInStock ? 'Out of stock' : variableAttributes.length && !allSelected ? 'Choose options' : 'Add to cart'}
          </button>
        </div>
      </div>

      <div className={`hf-purchase-service ${dark ? 'text-white/75' : 'text-[var(--hf-ink-soft)]'}`}>
        <div className={`flex items-start gap-2.5 ${dark ? 'bg-white/[.035] text-white/60' : 'text-[var(--hf-ink-soft)]'}`}>
          <TruckIcon className="mt-0.5 size-4 shrink-0" />
          <span><strong className={dark ? 'text-white/82' : 'text-black/70'}>Delivery</strong><br />Free UK · around 14 days</span>
        </div>
        <Link href="/returns" className={`flex items-start gap-2.5 transition hover:underline ${dark ? 'bg-white/[.035] text-white/60' : 'text-[var(--hf-ink-soft)]'}`}>
          <ArrowUturnLeftIcon className="mt-0.5 size-4 shrink-0" />
          <span><strong className={dark ? 'text-white/82' : 'text-black/70'}>Returns</strong><br />Free 14-day returns</span>
        </Link>
        <div className={`flex items-start gap-2.5 ${dark ? 'bg-white/[.035] text-white/60' : 'text-[var(--hf-ink-soft)]'}`}>
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
          <span><strong className={dark ? 'text-white/82' : 'text-black/70'}>Payment</strong><br />Secure card checkout</span>
        </div>
      </div>

      {mounted && showSticky && createPortal(
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#fbfaf7]/96 p-3 shadow-[0_-12px_36px_rgba(20,30,24,.08)] backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(.75rem, env(safe-area-inset-bottom))' }}>
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#172018]">{displayPrice}</p><p className="truncate text-[11px] text-black/55">{selectionSummary || (variableAttributes.length ? 'Choose product options' : 'Free UK delivery')}</p></div>
            <button type="button" disabled={!isPurchasable || !isInStock || loading || (allSelected && !selectionIsValid)} onClick={handleStickyAction} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[var(--hf-radius-pill)] bg-[var(--hf-brand)] px-5 text-sm font-semibold text-white disabled:opacity-45"><ShoppingBagIcon className="size-4" />{loading ? 'Adding…' : variableAttributes.length && !allSelected ? 'Choose options' : !isInStock ? 'Out of stock' : 'Add to cart'}</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
