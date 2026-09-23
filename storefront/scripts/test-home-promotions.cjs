/* Deterministic campaign content, price promises, assets and JSX checks. */
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
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file, compilerOptions: {
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
test('Hide empty/unavailable catalogue groups', () => {
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
test('Exactly three distinct promotions', () => {
  const p = [...getHomePromotions(fixtures, 'discovery'), ...getHomePromotions(fixtures, 'curated')]
  assert.equal(p.length, 3); assert.equal(new Set(p.map(x => x.id)).size, 3)
})
test('Native accessible links, headings and CTAs; no nested controls', () => {
  const tree = EditorialBanners({ products: fixtures, placement: 'discovery' })
  assert.equal(nodes(tree, 'a').length, 2); assert.equal(nodes(tree, 'h3').length, 2)
  assert.equal(nodes(tree, 'h2').length, 0); assert.equal(nodes(tree, 'button').length, 0)
  for (const a of nodes(tree, 'a')) {
    assert.equal(nodes(a.props.children, 'a').length, 0)
    const ids = [...nodes(a, 'h3'), ...nodes(a, 'span')].map(x => x.props.id)
    for (const id of a.props['aria-labelledby'].split(' ')) assert.equal(ids.includes(id), true)
  }
  assert.match(text(tree), /Kitchen tools that earn their space\./)
})
test('Price promise stays live HTML over decorative artwork', () => {
  const tree = EditorialBanners({ products: fixtures, placement: 'curated' })
  assert.equal(nodes(tree, 'a').length, 1); assert.equal(nodes(tree, 'img').length, 1)
  assert.match(text(tree), /Useful finds under £20\./)
})
test('One text-free scene per campaign, lazy and responsive', () => {
  for (const placement of ['curated', 'discovery']) {
    const tree = EditorialBanners({ products: fixtures, placement })
    for (const img of nodes(tree, 'img')) {
      assert.equal(img.props.loading, 'lazy'); assert.equal(img.props.alt, '')
      assert.equal(img.props.priority, undefined); assert.equal(typeof img.props.sizes, 'string')
      assert.match(img.props.src, /^\/home\/banners\/(kitchen|storage|budget)-scene\.webp$/)
      const b = fs.readFileSync(path.join(root, 'public', img.props.src))
      assert.equal(b.toString('ascii',0,4), 'RIFF'); assert.equal(b.toString('ascii',8,12), 'WEBP')
    }
    const divs = nodes(tree, 'div')
    assert.ok(divs.some(x => x.props['data-campaign-layer'] === 'content'))
    assert.ok(divs.some(x => x.props['data-campaign-layer'] === 'image'))
    assert.match(text(tree), /Illustrative room scenes/)
  }
})
test('All scene masters together stay below 80 KB', () => {
  const total = ['kitchen','storage','budget'].reduce((sum,id) => sum + fs.statSync(path.join(root, `public/home/banners/${id}-scene.webp`)).size,0)
  assert.ok(total < 80000, `Scene total: ${total}`)
})
test('Campaign style has editorial type, true image layering and mobile art direction', () => {
  const css = fs.readFileSync(path.join(root, 'components/home/editorial-banners.module.css'), 'utf8')
  assert.match(css, /var\(--hf-font-editorial\)/); assert.match(css, /mask-image/)
  assert.match(css, /max-width: 767px/); assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /var\(--hf-radius-lg\)/); assert.doesNotMatch(css, /rotate\(|!important/)
})
test('Editorial type is scoped; UI family remains independent', () => {
  const css = fs.readFileSync(path.join(root, 'app/campaign-typography.css'), 'utf8')
  assert.match(css, /body \{ font-family: var\(--hf-font-ui\)/)
  assert.match(css, /\.hf-editorial-home \.hf-display/)
  assert.doesNotMatch(css, /(?:^|\n)(?:h1|h2|h3|button|input|header)\s*\{/)
  const font = fs.readFileSync(path.join(root, 'lib/storefront/fonts.ts'),'utf8')
  assert.match(font, /next\/font\/google/); assert.match(font, /Cormorant_Garamond/)
  assert.match(font, /preload: false/); assert.match(font, /display: 'swap'/)
})
test('Groups retain natural placement and complete product rows', () => {
  const source = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8')
  assert.match(source, /<Hero products=\{products\} \/>\s*<CategoryGrid/)
  assert.match(source, /<CategoryGrid[^>]*>\s*<EditorialBanners[^>]*placement="curated"[^>]*\/>\s*<\/CategoryGrid>/)
  assert.match(source, /showcaseProducts\.map[\s\S]*placement="discovery"[\s\S]*<\/section>/)
  assert.doesNotMatch(source, /md:grid-cols-3 xl:grid-cols-4/)
})
for (const filename of ['components/home/editorial-banners.tsx', 'app/page.tsx', 'app/layout.tsx', 'lib/storefront/fonts.ts']) {
  test(`TSX syntax: ${filename}`, () => {
    const output = ts.transpileModule(fs.readFileSync(path.join(root, filename),'utf8'), { fileName: filename, compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true })
    assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0)
  })
}
console.log(`${passed} checks passed.`)
// Optional local geometry fixture; not a React hydration or live commerce test.
module.exports = { EditorialBanners, jsx, fixtures }
