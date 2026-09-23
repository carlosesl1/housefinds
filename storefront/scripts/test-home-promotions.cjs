/* Run from storefront: node scripts/test-home-promotions.cjs */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript')
const root = path.resolve(__dirname, '..')
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const source = fs.readFileSync(file, 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, reportDiagnostics: true })
  assert.equal((output.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0, file)
  const module = { exports: {} }
  const imports = (name) => {
    if (name.startsWith('@/')) return load(path.join(root, `${name.slice(2)}.ts`))
    throw new Error(`Unexpected import ${name}`)
  }
  vm.runInNewContext(output.outputText, { module, exports: module.exports, require: imports }, { filename: file })
  cache.set(file, module.exports)
  return module.exports
}
const { isUnderTwentyProduct, getHomePromotions } = load(path.join(root, 'lib/storefront/home-promotions.ts'))
function product(patch = {}) {
  return { id: 1, name: 'Oil Spray Bottle', slug: 'oil-spray', is_purchasable: true, is_in_stock: true,
    prices: { price: '500', currency_code: 'GBP', currency_minor_unit: 2 }, images: [{ src: '/real-product.webp' }], ...patch }
}
let passed = 0
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`) }
test('Includes products below £10 as well as £10–£20', () => {
  assert.equal(isUnderTwentyProduct(product()), true)
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '1999', currency_code: 'GBP', currency_minor_unit: 2 } })), true)
})
test('Excludes exactly £20 and above', () => {
  for (const price of ['2000', '3500']) assert.equal(isUnderTwentyProduct(product({ prices: { price, currency_code: 'GBP', currency_minor_unit: 2 } })), false)
})
test('Checks the most expensive variant, not just the cheapest', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '500', max_amount: '2022' } } })), false)
})
test('Accepts a range wholly below £20', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '100', max_amount: '1999' } } })), true)
})
test('Rejects malformed, empty and inverted prices', () => {
  for (const price of ['', ' ', 'invalid', 'Infinity', '-1', '0']) assert.equal(isUnderTwentyProduct(product({ prices: { price, currency_code: 'GBP', currency_minor_unit: 2 } })), false)
  assert.equal(isUnderTwentyProduct(product({ prices: { currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '900', max_amount: '200' } } })), false)
})
test('Rejects non-GBP prices and invalid minor units', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'USD', currency_minor_unit: 2 } })), false)
  for (const unit of [-1, 1.5, 9]) assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'GBP', currency_minor_unit: unit } })), false)
})
test('Excludes unavailable products', () => {
  assert.equal(isUnderTwentyProduct(product({ is_in_stock: false })), false)
  assert.equal(isUnderTwentyProduct(product({ is_purchasable: false })), false)
})
test('No banners on an empty/unavailable catalogue', () => {
  assert.equal(getHomePromotions([], 'discovery').length, 0)
  assert.equal(getHomePromotions([], 'curated').length, 0)
})
test('No arbitrary product fallback for category banners', () => {
  const banners = getHomePromotions([product()], 'discovery')
  assert.equal(banners.length, 1)
  assert.equal(banners[0].id, 'kitchen')
  assert.equal(banners[0].href, '/shop?category=kitchen-tools')
})
test('Only real available products with images are featured', () => {
  assert.equal(getHomePromotions([product({ images: [] })], 'discovery').length, 0)
  assert.equal(getHomePromotions([product({ is_in_stock: false })], 'discovery').length, 0)
})
test('Under £20 banner opens its real curated destination', () => {
  const banner = getHomePromotions([product()], 'curated').find((item) => item.id === 'under-20')
  assert.equal(banner.href, '/collections/under-20')
  assert.equal(banner.products.every(isUnderTwentyProduct), true)
})
test('No price banner when no product qualifies', () => {
  const expensive = product({ prices: { price: '2500', currency_code: 'GBP', currency_minor_unit: 2 } })
  assert.equal(getHomePromotions([expensive], 'curated').some((item) => item.id === 'under-20'), false)
})
for (const filename of ['components/home/editorial-banners.tsx', 'app/collections/under-20/page.tsx', 'app/page.tsx']) {
  test(`TSX syntax: ${filename}`, () => {
    const source = fs.readFileSync(path.join(root, filename), 'utf8')
    const output = ts.transpileModule(source, { fileName: filename, compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true })
    assert.equal((output.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error).length, 0)
  })
}
test('Real text and one native link per banner; no client JavaScript', () => {
  const source = fs.readFileSync(path.join(root, 'components/home/editorial-banners.tsx'), 'utf8')
  assert.equal(source.includes("'use client'"), false)
  assert.equal(source.includes('<button'), false)
  assert.equal(source.includes('{banner.title}</h2>'), true)
  assert.equal(source.includes('priority='), false)
})
console.log(`${passed} checks passed.`)
