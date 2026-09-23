/* Deterministic merchandising + presentation checks. Run from storefront. */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript')
const root = path.resolve(__dirname, '..')
const cache = new Map()
const jsx = (type, props = {}) => typeof type === 'function' ? type(props) : ({ type, props })
const icons = new Proxy({}, { get: (_, name) => props => jsx('svg', { ...props, 'data-icon': String(name) }) })
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const source = fs.readFileSync(file, 'utf8')
  const output = ts.transpileModule(source, { fileName: file, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }, reportDiagnostics: true })
  assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, file)
  const module = { exports: {} }
  const imports = name => {
    if (name.startsWith('@/')) return load(path.join(root, `${name.slice(2)}.ts`))
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
    if (name === 'next/link') return props => jsx('a', props)
    if (name === 'next/image') return props => jsx('img', props)
    if (name === '@heroicons/react/24/outline') return icons
    if (name.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) }
    throw new Error(`Unexpected import ${name}`)
  }
  vm.runInNewContext(output.outputText, { module, exports: module.exports, require: imports }, { filename: file })
  cache.set(file, module.exports)
  return module.exports
}
function nodes(node, type) {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(n => nodes(n, type))
  return [...(node.type === type ? [node] : []), ...nodes(node.props.children, type)]
}
function text(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node !== 'object') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return text(node.props.children)
}
const { isUnderTwentyProduct, getHomePromotions } = load(path.join(root, 'lib/storefront/home-promotions.ts'))
const { EditorialBanners } = load(path.join(root, 'components/home/editorial-banners.tsx'))
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
  for (const price of ['2000','3500']) assert.equal(isUnderTwentyProduct(product({ prices: { price, currency_code: 'GBP', currency_minor_unit: 2 } })), false)
})
test('Checks most expensive variant rather than lowest starting price', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '500', max_amount: '2022' } } })), false)
})
test('Accepts only a range wholly below £20', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '100', max_amount: '1999' } } })), true)
})
test('Rejects malformed, empty and inverted prices', () => {
  for (const price of ['', ' ', 'invalid', 'Infinity', '-1', '0']) assert.equal(isUnderTwentyProduct(product({ prices: { price, currency_code: 'GBP', currency_minor_unit: 2 } })), false)
  assert.equal(isUnderTwentyProduct(product({ prices: { currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '900', max_amount: '200' } } })), false)
})
test('Rejects non-GBP and invalid minor units', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'USD', currency_minor_unit: 2 } })), false)
  for (const unit of [-1,1.5,9]) assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'GBP', currency_minor_unit: unit } })), false)
})
test('Unavailable products do not qualify', () => {
  assert.equal(isUnderTwentyProduct(product({ is_in_stock: false })), false)
  assert.equal(isUnderTwentyProduct(product({ is_purchasable: false })), false)
})
test('Empty catalogue renders no campaign chrome', () => {
  assert.equal(EditorialBanners({ products: [], placement: 'discovery' }), null)
  assert.equal(EditorialBanners({ products: [], placement: 'curated' }), null)
})
test('Categories never fall back to an unrelated product', () => {
  const p = getHomePromotions([product()], 'discovery')
  assert.equal(p.length, 1); assert.equal(p[0].id, 'kitchen')
  assert.equal(p[0].href, '/shop?category=kitchen-tools')
})
test('Hide empty/unavailable image selections', () => {
  assert.equal(getHomePromotions([product({ images: [] })], 'discovery').length, 0)
  assert.equal(getHomePromotions([product({ is_in_stock: false })], 'discovery').length, 0)
})
test('Budget banner links to actual under-20 collection', () => {
  const p = getHomePromotions([product()], 'curated')
  assert.equal(p.length, 1); assert.equal(p[0].href, '/collections/under-20')
  assert.equal(p[0].products.every(isUnderTwentyProduct), true)
})
test('No price banner with an expensive-only catalogue', () => {
  const p = product({ prices: { price: '2500', currency_code: 'GBP', currency_minor_unit: 2 } })
  assert.equal(getHomePromotions([p], 'curated').length, 0)
})
const fixtures = [product(), product({ id: 2, name: 'Covered Toothbrush Holder', slug: 'covered-toothbrush-holder' })]
test('Three intentional promotions, no duplicate generic edit banner', () => {
  const p = [...getHomePromotions(fixtures, 'discovery'), ...getHomePromotions(fixtures, 'curated')]
  assert.equal(p.length, 3); assert.equal(p.some(b => b.id === 'edit'), false)
})
test('One native link, one photo and an h3 per category banner', () => {
  const tree = EditorialBanners({ products: fixtures, placement: 'discovery' })
  assert.equal(nodes(tree, 'a').length, 2); assert.equal(nodes(tree, 'h3').length, 2)
  assert.equal(nodes(tree, 'h2').length, 0); assert.equal(nodes(tree, 'img').length, 2)
  assert.equal(nodes(tree, 'button').length, 0)
  for (const a of nodes(tree, 'a')) assert.equal(nodes(a.props.children, 'a').length, 0)
  assert.match(text(tree), /Everyday prep\. Made simpler\./)
})
test('Budget strip is compact HTML, not another photo collage', () => {
  const tree = EditorialBanners({ products: fixtures, placement: 'curated' })
  assert.equal(nodes(tree, 'a').length, 1); assert.equal(nodes(tree, 'img').length, 0)
  assert.match(text(tree), /Useful finds under £20\./)
})
test('Images remain lazy and decorative; native text stays readable', () => {
  for (const img of nodes(EditorialBanners({ products: fixtures }), 'img')) {
    assert.equal(img.props.loading, 'lazy'); assert.equal(img.props.alt, '')
    assert.equal(img.props.priority, undefined)
  }
})
test('No serif, rotated photos, extra image backgrounds or CSS ID mismatch', () => {
  const css = fs.readFileSync(path.join(root, 'components/home/editorial-banners.module.css'), 'utf8')
  assert.doesNotMatch(css, /Georgia|Times New Roman|rotate\(|url\(|!important/)
  assert.match(css, /font: inherit/); assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /var\(--hf-radius-lg\)/); assert.match(css, /var\(--hf-brand-muted\)/)
})
test('Groups are embedded into their sections, not after the hero', () => {
  const source = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8')
  assert.match(source, /<Hero products=\{products\} \/>\s*<CategoryGrid/)
  assert.match(source, /<CategoryGrid[^>]*>\s*<EditorialBanners[^>]*placement="curated"[^>]*\/>\s*<\/CategoryGrid>/)
  assert.match(source, /showcaseProducts\.map[\s\S]*placement="discovery"[\s\S]*<\/section>/)
  assert.doesNotMatch(source, /md:grid-cols-3 xl:grid-cols-4/)
})
for (const filename of ['components/home/editorial-banners.tsx', 'components/home/category-grid.tsx', 'app/page.tsx']) {
  test(`TSX syntax: ${filename}`, () => {
    const output = ts.transpileModule(fs.readFileSync(path.join(root, filename),'utf8'), { fileName: filename, compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true })
    assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0)
  })
}
console.log(`${passed} checks passed.`)
// Optional static rendering fixture for local browser geometry QA; no React/Next server emulation.
module.exports = { EditorialBanners, jsx, fixtures }
