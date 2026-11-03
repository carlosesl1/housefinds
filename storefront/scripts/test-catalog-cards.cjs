/* Catalog card eligibility and customer-facing metadata stay grounded in Woo fields. */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript')

const root = path.resolve(__dirname, '..')
const moduleRoot = path.dirname(root)
const cache = new Map()
function loadTs(filename) {
  filename = path.resolve(filename)
  if (cache.has(filename)) return cache.get(filename).exports
  const source = fs.readFileSync(filename, 'utf8')
  const result = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  })
  assert.equal((result.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0, filename)
  const module = new Module(filename, moduleRoot)
  cache.set(filename, module)
  module.filename = filename
  module.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = module.require.bind(module)
  module.require = (request) => {
    if (request.startsWith('@/') || request.startsWith('.')) {
      const base = request.startsWith('@/') ? path.join(root, request.slice(2)) : path.resolve(path.dirname(filename), request)
      for (const candidate of [base, `${base}.ts`, path.join(base, 'index.ts')]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile() && candidate.endsWith('.ts')) return loadTs(candidate)
      }
    }
    return originalRequire(request)
  }
  module._compile(result.outputText, filename)
  return module.exports
}

const cards = loadTs(path.join(root, 'lib/storefront/card-presentation.ts'))
const term = (id, name) => ({ id, name, slug: name.toLowerCase().replace(/\s+/g, '-') })
const prices = (patch = {}) => ({ price: '899', regular_price: '899', sale_price: '', currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2, ...patch })
const product = (patch = {}) => ({
  id: 1, name: 'Find', slug: 'find', type: 'simple', has_options: false, variations: [],
  is_purchasable: true, is_in_stock: true, add_to_cart: undefined,
  average_rating: '4.5', review_count: 12, prices: prices(), attributes: [], ...patch,
})
let passed = 0
function test(name, run) { run(); passed += 1; console.log(`PASS ${name}`) }

test('Allows quick add only when one is a valid quantity', () => {
  assert.equal(cards.isQuickAddEligible(product()), true)
  assert.equal(cards.isQuickAddEligible(product({ type: 'variable' })), false)
  assert.equal(cards.isQuickAddEligible(product({ has_options: true })), false)
  assert.equal(cards.isQuickAddEligible(product({ variations: [{ id: 2, attributes: [] }] })), false)
  assert.equal(cards.isQuickAddEligible(product({ add_to_cart: { minimum: 2 } })), false)
  assert.equal(cards.isQuickAddEligible(product({ add_to_cart: { maximum: 0 } })), false)
  assert.equal(cards.isQuickAddEligible(product({ add_to_cart: { multiple_of: 2 } })), false)
  assert.equal(cards.isQuickAddEligible(product({ add_to_cart: { minimum: 1, maximum: 5, multiple_of: 1 } })), true)
})

test('Under £10 requires GBP and every displayed price bound below the threshold', () => {
  assert.equal(cards.cardBadge(product()), 'Under £10')
  assert.equal(cards.cardBadge(product({ prices: prices({ price_range: { min_amount: '200', max_amount: '999' } }) })), 'Under £10')
  assert.equal(cards.cardBadge(product({ prices: prices({ price_range: { min_amount: '200', max_amount: '1000' } }) })), undefined)
  assert.equal(cards.cardBadge(product({ prices: prices({ currency_code: 'USD' }) })), undefined)
  assert.equal(cards.cardBadge(product({ is_in_stock: false })), 'Out of stock')
  assert.equal(cards.cardBadge(product({ type: 'variable' })), 'Options available')
  assert.equal(cards.cardBadge(product({ prices: prices({ price: '' }) })), undefined)
})

test('Option summaries use visible attributes and omit supplier fields', () => {
  const summary = cards.cardOptionSummary(product({ attributes: [
    { id: 1, name: 'Color', has_variations: true, terms: [term(1, 'Red'), term(2, 'Blue'), term(3, 'Green')] },
    { id: 2, name: 'Size', has_variations: true, terms: [term(4, 'Small'), term(5, 'Large')] },
    { id: 3, name: 'Ships From', has_variations: true, terms: [term(6, 'China'), term(7, 'UK')] },
  ] }))
  assert.equal(summary, '3 colours / 2 sizes')
  assert.equal(cards.cardOptionSummary(product({ attributes: [{ id: 5, name: 'Material', has_variations: false, terms: [term(8, 'Steel'), term(9, 'Plastic')] }] })), undefined)
})

test('Rating descriptions carry the real aggregate and hide invalid values', () => {
  assert.equal(cards.cardRatingLabel(product()), 'Rated 4.5 out of 5 from 12 reviews')
  assert.equal(cards.cardRatingLabel(product({ average_rating: '0' })), undefined)
  assert.equal(cards.cardRatingLabel(product({ average_rating: '5.2' })), undefined)
  assert.equal(cards.cardRatingLabel(product({ review_count: 0 })), undefined)
})

test('Unavailable cards link to details and available variable cards choose options', () => {
  assert.equal(cards.cardActionLabel(product()), 'View product')
  assert.equal(cards.cardActionLabel(product({ type: 'variable' })), 'Choose options')
  assert.equal(cards.cardActionLabel(product({ type: 'variable', is_in_stock: false })), 'View product')
})

const shop = loadTs(path.join(root, 'lib/storefront/shop.ts'))

test('Filter links preserve independent choices and clear only requested fields', () => {
  const state = { category: 'kitchen-tools', price: 'under-10', sort: 'price-high', q: 'oil & spray', stock: 'in-stock' }
  const url = new URL(shop.shopHref(state, { price: '' }), 'https://example.test')
  assert.equal(url.searchParams.get('category'), 'kitchen-tools')
  assert.equal(url.searchParams.get('price'), null)
  assert.equal(url.searchParams.get('sort'), 'price-high')
  assert.equal(url.searchParams.get('q'), 'oil & spray')
  assert.equal(url.searchParams.get('stock'), 'in-stock')
  assert.equal(shop.shopHref({ sort: 'recommended' }), '/shop')
})

test('Price filters include matching variant ranges and respect boundary prices', () => {
  const items = [product({ id: 1, prices: prices({ price: '999' }) }), product({ id: 2, prices: prices({ price: '1000' }) }), product({ id: 3, prices: prices({ price: '2000' }) }), product({ id: 4, prices: prices({ price_range: { min_amount: '850', max_amount: '2100' } }) })]
  assert.deepEqual(shop.filterShopPrice(items, 'under-10').map(p => p.id), [1, 4])
  assert.deepEqual(shop.filterShopPrice(items, '10-20').map(p => p.id), [2, 4])
  assert.deepEqual(shop.filterShopPrice(items, '20-plus').map(p => p.id), [3, 4])
})

test('Collection search preserves explicit price order instead of reranking it', () => {
  const items = [product({ id: 1, name: 'Stainless Steel Cutting Board', slug: 'stainless-steel-cutting-board' }), product({ id: 2, name: 'Oil Spray Bottle', slug: 'oil-spray-bottle' }), product({ id: 3, name: 'Automatic Door Closer', slug: 'automatic-door-closer' })]
  assert.deepEqual(shop.searchShopProducts(items, 'kitchen', 'price-high').map(p => p.id), [1, 2])
  assert.deepEqual(shop.searchShopProducts(items, 'zzzznotafind', 'recommended'), [])
  assert.deepEqual(shop.shopSortQuery('price-high'), { orderby: 'price', order: 'desc' })
})

console.log(`Passed ${passed} catalog tests`)
