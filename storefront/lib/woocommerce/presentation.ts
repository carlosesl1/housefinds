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
  [/oil spray|oil brush/i, 'Pour, spray and brush with less mess.'],
  [/cutting board|chopping board/i, 'A durable prep surface for everyday cooking.'],
  [/shoe washing|wash bag/i, 'Keep shoes protected through the wash.'],
  [/toothbrush holder/i, 'Keep bathroom essentials covered and tidy.'],
  [/shoe storage|shoe rack|x-type/i, 'More shoe storage without taking over the hallway.'],
  [/spoon scale|digital spoon/i, 'Measure ingredients directly from the spoon.'],
  [/bath mat|floor mat/i, 'Soft underfoot with extra grip where it matters.'],
  [/door closer|surface door stop/i, 'A simple way to make doors close themselves.'],
  [/mosquito racket|insect killer/i, 'A practical indoor and outdoor pest helper.'],
  [/motion sensor led|led bar light|induction night light/i, 'Light where you need it, only when you need it.'],
  [/homefish|aurora projector|ocean wave/i, 'Turn blank walls into atmosphere.'],
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
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (raw) return raw.length > 90 ? `${raw.slice(0, 87).trim()}…` : raw
  return 'A useful find for everyday living.'
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
