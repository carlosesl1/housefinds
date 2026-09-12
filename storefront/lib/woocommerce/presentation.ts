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
]

export function displayProductName(name: string) {
  const match = nameRules.find(([pattern]) => pattern.test(name))
  if (match) return match[1]
  return name.length > 58 ? `${name.slice(0, 55).trim()}…` : name
}

export function displayProductTagline(product: WooProduct) {
  const match = taglineRules.find(([pattern]) => pattern.test(product.name))
  if (match) return match[1]

  const raw = (product.short_description || product.description)
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (raw) return raw.length > 90 ? `${raw.slice(0, 87).trim()}…` : raw
  return 'A useful find for everyday living.'
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
  return products.find((product) => {
    const haystack = `${product.name} ${product.slug}`.toLowerCase()
    return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
  })
}

export function pickHeroProduct(products: WooProduct[]) {
  return (
    findProductByKeywords(products, ['door closer']) ||
    findProductByKeywords(products, ['motion sensor led']) ||
    findProductByKeywords(products, ['shoe storage']) ||
    products[0]
  )
}
