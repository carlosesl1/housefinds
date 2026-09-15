import type { WooAttributeTerm, WooProductAttribute } from '@/lib/woocommerce/types'
import { storefrontAttributeName, storefrontTermName } from '@/lib/storefront/catalog'

type ColourForceTerm = {
  term: WooAttributeTerm
  colour: string
  force: string
  forceGrams: number
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function parseColourForceTerm(term: WooAttributeTerm): ColourForceTerm | null {
  const raw = term.name.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
  const match = raw.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*(g|kg)\s*force$/i)
  if (!match) return null

  const colour = titleCase(match[1].trim())
  if (!colour) return null

  const amount = Number(match[2])
  const unit = match[3].toLowerCase()
  const forceGrams = unit === 'kg' ? amount * 1000 : amount
  const force = `${match[2]}${unit}`

  return { term, colour, force, forceGrams }
}

export function colourForceTerms(attribute: WooProductAttribute) {
  const parsed = attribute.terms.map(parseColourForceTerm)
  if (parsed.some((entry) => !entry)) return null

  const terms = parsed.filter((entry): entry is ColourForceTerm => Boolean(entry))
  const colours = new Set(terms.map((entry) => entry.colour))
  const forces = new Set(terms.map((entry) => entry.force))
  if (colours.size < 2 || forces.size < 2) return null

  return terms
}

export function storefrontAttributeRows(attribute: WooProductAttribute) {
  const colourForce = colourForceTerms(attribute)
  if (colourForce) {
    const colours = Array.from(new Set(colourForce.map((entry) => entry.colour)))
    const forces = Array.from(
      new Map(
        colourForce
          .slice()
          .sort((a, b) => a.forceGrams - b.forceGrams)
          .map((entry) => [entry.force, entry]),
      ).values(),
    ).map((entry) => entry.force)

    return [
      { label: 'Colour', values: colours },
      { label: 'Closing force', values: forces },
    ]
  }

  return [
    {
      label: storefrontAttributeName(attribute),
      values: attribute.terms.map((term) => storefrontTermName(term)),
    },
  ]
}
