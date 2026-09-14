import type { WooProduct } from './types'

const nameRules: Array<[RegExp, string]> = [
  [/oil spray|oil brush/i, 'Oil Spray Bottle'],
  [/cutting board|chopping board/i, 'Stainless Steel Cutting Board'],
  [/shoe washing|wash bag/i, 'Shoe Washing Bag'],
  [/toothbrush holder/i, 'Covered Toothbrush Holder'],
  [/shoe storage|shoe rack|x-type/i, 'Space-Saving Shoe Rack'],
  [/spoon scale|digital spoon/i, 'Digital Spoon Scale'],
  [/bath mat|floor mat/i, 'Non-Slip Bath Mat'],
  [/door closer|surface door stop/i, 'Automatic Sensor Door Closer'],
  [/mosquito racket|insect killer/i, 'Retractable Mosquito Racket'],
  [/motion sensor led|led bar light|induction night light/i, 'Motion Sensor LED Bar Light'],
  [/homefish|aurora projector|ocean wave/i, 'RGB Aurora Projector'],
]

const taglineRules: Array<[RegExp, string]> = [
  [/oil spray|oil brush/i, 'Pour, spray and brush with less mess while you cook.'],
  [/cutting board|chopping board/i, 'A durable prep surface built for everyday kitchen work.'],
  [/shoe washing|wash bag/i, 'Protect your shoes while giving them a proper wash.'],
  [/toothbrush holder/i, 'Keep bathroom essentials covered, tidy and off the counter.'],
  [/shoe storage|shoe rack|x-type/i, 'More shoe storage without letting the hallway feel crowded.'],
  [/spoon scale|digital spoon/i, 'Measure small ingredients directly from the spoon.'],
  [/bath mat|floor mat/i, 'Soft underfoot with extra grip where it matters.'],
  [/door closer|surface door stop/i, 'A compact way to make everyday doors close themselves.'],
  [/mosquito racket|insect killer/i, 'A practical rechargeable helper for indoor and outdoor pests.'],
  [/motion sensor led|led bar light|induction night light/i, 'Light where you need it, only when you need it.'],
  [/homefish|aurora projector|ocean wave/i, 'Turn blank walls and quiet corners into atmosphere.'],
]

type Story = {
  eyebrow: string
  headline: string
  intro: string
  benefits: string[]
}

const storyRules: Array<[RegExp, Story]> = [
  [/oil spray|oil brush/i, {
    eyebrow: 'A cleaner way to cook',
    headline: 'Control the oil. Keep the flavour.',
    intro: 'Designed for quick, even application when frying, roasting, grilling or finishing food.',
    benefits: ['Spray or brush with more control', 'Transparent body makes refills easy to see', 'Useful across frying, roasting and BBQ prep'],
  }],
  [/cutting board|chopping board/i, {
    eyebrow: 'Kitchen workhorse',
    headline: 'A prep surface made to earn its space.',
    intro: 'A simple, durable board for fruit, vegetables, meat and the everyday jobs that happen around the kitchen.',
    benefits: ['Double-sided prep surface', 'Easy-to-clean stainless steel design', 'Built for daily chopping and food prep'],
  }],
  [/shoe washing|wash bag/i, {
    eyebrow: 'A neater wash day',
    headline: 'Wash the shoes. Protect the rest.',
    intro: 'A protective wash bag that keeps shoes contained in the machine and makes occasional deep-cleaning less awkward.',
    benefits: ['Keeps shoes contained during washing', 'Helps reduce direct contact with the drum', 'Reusable for trainers and casual shoes'],
  }],
  [/door closer|surface door stop/i, {
    eyebrow: 'Small upgrade, quieter home',
    headline: 'Let the door take care of itself.',
    intro: 'A compact automatic closer for spaces where doors are constantly being left open, drifting or slamming.',
    benefits: ['Punch-free installation concept', 'Automatic pull-cord closing action', 'Useful for bedrooms, hallways and everyday entry points'],
  }],
  [/spoon scale|digital spoon/i, {
    eyebrow: 'Measure as you scoop',
    headline: 'Less guessing in every spoonful.',
    intro: 'A compact digital scale for coffee, flour, powders and small ingredients where precision matters.',
    benefits: ['Measure directly in the spoon', 'Compact digital display', 'Useful for coffee, baking and portioning'],
  }],
  [/motion sensor led|led bar light|induction night light/i, {
    eyebrow: 'Light only when you need it',
    headline: 'A smarter glow for overlooked spaces.',
    intro: 'Rechargeable motion-sensor lighting for cupboards, wardrobes, bedside areas and dark corners.',
    benefits: ['Motion-activated convenience', 'USB-C rechargeable design', 'Easy fit for wardrobes, kitchens and bedside use'],
  }],
  [/shoe storage|shoe rack|x-type/i, {
    eyebrow: 'Use the vertical space',
    headline: 'More shoes. Less hallway.',
    intro: 'A compact multi-tier rack that makes everyday storage feel more deliberate and less cluttered.',
    benefits: ['Multi-tier storage footprint', 'Useful in bedrooms, dorms and entryways', 'Keeps pairs visible and easier to reach'],
  }],
  [/toothbrush holder/i, {
    eyebrow: 'Clear the bathroom counter',
    headline: 'A cleaner home for everyday essentials.',
    intro: 'A covered wall-mounted holder designed to keep toothbrushes organised and protected between uses.',
    benefits: ['Wall-mounted organisation', 'Protective cover', 'Helps free up counter space'],
  }],
  [/bath mat|floor mat/i, {
    eyebrow: 'A steadier step',
    headline: 'Comfort underfoot. Grip where it matters.',
    intro: 'A bathroom mat designed to make the everyday step out of the shower feel softer and more secure.',
    benefits: ['Textured surface for everyday grip', 'Soft landing for bathroom routines', 'Easy home upgrade with no installation'],
  }],
  [/mosquito racket|insect killer/i, {
    eyebrow: 'A practical pest helper',
    headline: 'Reach the mosquito before it reaches you.',
    intro: 'A rechargeable electric racket with an extendable form for dealing with flying insects indoors or outside.',
    benefits: ['Rechargeable for repeated use', 'Retractable design extends reach', 'Useful around bedrooms, patios and living spaces'],
  }],
  [/homefish|aurora projector|ocean wave/i, {
    eyebrow: 'Atmosphere on demand',
    headline: 'Change the mood without changing the room.',
    intro: 'A compact RGB projector that adds moving colour and ambient light to bedrooms, desks and quiet corners.',
    benefits: ['Multiple colours and lighting moods', 'Remote-controlled adjustments', 'Rechargeable, portable accent lighting'],
  }],
]

const fulfilmentLocationPattern = /\b(?:ships?\s*from|dispatch\s*from|warehouse(?:\s*location)?)\b\s*[:\-]?\s*(?:china mainland|china|united states|spain|russian federation|poland|france|germany|czech republic|belgium)\b/gi

function curatedProductName(name: string) {
  return nameRules.find(([pattern]) => pattern.test(name))?.[1]
}

function safeFallbackProductName(name: string) {
  const cleaned = name
    .replace(fulfilmentLocationPattern, ' ')
    .replace(/\s+[|/·]\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,:;|/\-]+|[\s,:;|/\-]+$/g, '')
    .trim()

  const publicName = cleaned || 'Housefinds product'
  return publicName.length > 58 ? `${publicName.slice(0, 55).trim()}…` : publicName
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function displayProductName(name: string) {
  const curated = curatedProductName(name)
  if (curated) return curated
  return safeFallbackProductName(name)
}

/**
 * Keep DSers/WooCommerce slugs untouched operationally while giving products
 * with a curated Housefinds name a stable, readable public URL. Unknown items
 * deliberately keep their Woo slug so two similar imports cannot collide.
 */
export function storefrontProductSlug(product: Pick<WooProduct, 'name' | 'slug'>) {
  const curated = curatedProductName(product.name)
  return curated ? slugify(curated) || product.slug : product.slug
}

export function displayProductTagline(product: WooProduct) {
  const match = taglineRules.find(([pattern]) => pattern.test(product.name))
  if (match) return match[1]

  // Unknown catalog items must never inherit marketplace descriptions into the
  // public storefront. Keep the fallback intentionally generic until Housefinds
  // has written or verified product-specific customer copy.
  return 'A practical Housefinds pick for everyday living.'
}

export function getProductStory(product: WooProduct): Story {
  const match = storyRules.find(([pattern]) => pattern.test(product.name))
  if (match) return match[1]
  return {
    eyebrow: 'Housefinds pick',
    headline: 'A useful little upgrade for everyday life.',
    intro: displayProductTagline(product),
    benefits: ['Chosen for everyday usefulness', 'Designed to solve a small household problem', 'Simple enough to fit naturally into your routine'],
  }
}

export function findProductByKeywords(products: WooProduct[], keywords: string[]) {
  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase()
    const match = products.find((product) => `${product.name} ${product.slug}`.toLowerCase().includes(normalizedKeyword))
    if (match) return match
  }
  return undefined
}

export function pickHeroProduct(products: WooProduct[]) {
  return (
    findProductByKeywords(products, ['door closer']) ||
    findProductByKeywords(products, ['motion sensor led']) ||
    findProductByKeywords(products, ['shoe storage']) ||
    products[0]
  )
}
