/* Deterministic campaign content, real price boundaries and responsive assets. */
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
    if (name === 'next/image') return { __esModule: true, default: props => jsx('img', props), getImageProps: props => ({ props: { ...props, srcSet: `${props.src} ${props.width}w` } }) }
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
  return [...(node.type === type ? [node] : []), ...nodes(node.props?.children, type)]
}
function text(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node !== 'object') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return text(node.props?.children)
}
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const { isUnderTwentyProduct, getHomePromotions } = load(path.join(root, 'lib/storefront/home-promotions.ts'))
const { EditorialBanners } = load(path.join(root, 'components/home/editorial-banners.tsx'))
function product(patch = {}) {
  return { id: 1, name: 'Oil Spray Bottle', slug: 'oil-spray', is_purchasable: true, is_in_stock: true,
    prices: { price: '500', currency_code: 'GBP', currency_minor_unit: 2 }, images: [{ src: '/real-product.webp' }], ...patch }
}
let passed = 0
function test(name, fn) { fn(); passed++; console.log(`PASS ${name}`) }
test('Includes prices below £10 and £19.99', () => {
  assert.equal(isUnderTwentyProduct(product()), true)
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '1999', currency_code: 'GBP', currency_minor_unit: 2 } })), true)
})
test('Excludes £20 and above', () => {
  for (const price of ['2000', '3500']) assert.equal(isUnderTwentyProduct(product({ prices: { price, currency_code: 'GBP', currency_minor_unit: 2 } })), false)
})
test('Checks every variant rather than starting price', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '500', max_amount: '2022' } } })), false)
  assert.equal(isUnderTwentyProduct(product({ prices: { currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '100', max_amount: '1999' } } })), true)
})
test('Rejects malformed, empty and inverted prices', () => {
  for (const price of ['', ' ', 'invalid', 'Infinity', '-1', '0']) assert.equal(isUnderTwentyProduct(product({ prices: { price, currency_code: 'GBP', currency_minor_unit: 2 } })), false)
  assert.equal(isUnderTwentyProduct(product({ prices: { currency_code: 'GBP', currency_minor_unit: 2, price_range: { min_amount: '900', max_amount: '200' } } })), false)
})
test('Rejects non-GBP and invalid minor units', () => {
  assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'USD', currency_minor_unit: 2 } })), false)
  for (const unit of [-1, 1.5, 9]) assert.equal(isUnderTwentyProduct(product({ prices: { price: '500', currency_code: 'GBP', currency_minor_unit: unit } })), false)
})
test('Unavailable products do not qualify', () => {
  assert.equal(isUnderTwentyProduct(product({ is_in_stock: false })), false)
  assert.equal(isUnderTwentyProduct(product({ is_purchasable: false })), false)
})
test('Empty catalogue renders no campaign chrome', () => {
  for (const placement of ['discovery', 'curated']) assert.equal(EditorialBanners({ products: [], placement }), null)
})
test('Categories never fall back to unrelated products', () => {
  const p = getHomePromotions([product()], 'discovery')
  assert.equal(p.length, 1); assert.equal(p[0].id, 'kitchen'); assert.equal(p[0].href, '/shop?category=kitchen-tools')
})
test('Hide unavailable/no-image groups', () => {
  assert.equal(getHomePromotions([product({ images: [] })], 'discovery').length, 0)
  assert.equal(getHomePromotions([product({ is_in_stock: false })], 'discovery').length, 0)
})
test('Budget campaign links to the real price-filtered destination', () => {
  const p = getHomePromotions([product()], 'curated')
  assert.equal(p.length, 1); assert.equal(p[0].href, '/collections/under-20'); assert.equal(p[0].products.every(isUnderTwentyProduct), true)
  assert.equal(getHomePromotions([product({ prices: { price: '2500', currency_code: 'GBP', currency_minor_unit: 2 } })], 'curated').length, 0)
})
const fixtures = [product(), product({ id: 2, name: 'Covered Toothbrush Holder', slug: 'covered-toothbrush-holder' })]
test('Three unique campaigns with one native link each', () => {
  const p = [...getHomePromotions(fixtures, 'discovery'), ...getHomePromotions(fixtures, 'curated')]
  assert.equal(p.length, 3); assert.equal(new Set(p.map(x => x.id)).size, 3)
  const tree = EditorialBanners({ products: fixtures })
  assert.equal(nodes(tree, 'a').length, 2); assert.equal(nodes(tree, 'h3').length, 2); assert.equal(nodes(tree, 'button').length, 0)
  for (const a of nodes(tree, 'a')) {
    assert.equal(nodes(a.props.children, 'a').length, 0)
    const ids = [...nodes(a, 'h3'), ...nodes(a, 'span')].map(x => x.props.id)
    for (const id of a.props['aria-labelledby'].split(' ')) assert.ok(ids.includes(id))
  }
})
test('Price promise, title and action remain live text', () => {
  assert.match(text(EditorialBanners({ products: fixtures, placement: 'curated' })), /Useful finds under £20\./)
  assert.match(text(EditorialBanners({ products: fixtures })), /Kitchen tools that earn their space\./)
})
test('One art-directed picture per campaign, no duplicate image downloads', () => {
  for (const placement of ['curated', 'discovery']) {
    const tree = EditorialBanners({ products: fixtures, placement })
    assert.equal(nodes(tree, 'picture').length, nodes(tree, 'a').length)
    assert.equal(nodes(tree, 'img').length, nodes(tree, 'a').length)
    for (const img of nodes(tree, 'img')) {
      assert.equal(img.props.alt, ''); assert.equal(img.props.loading, 'lazy'); assert.equal(img.props.priority, undefined)
      assert.equal(typeof img.props.sizes, 'string')
      assert.match(img.props.src, /^\/home\/banners\/(kitchen|storage|budget)-scene\.webp$/)
    }
    for (const source of nodes(tree, 'source')) {
      assert.equal(source.props.media, '(max-width: 767px)')
      assert.match(source.props.srcSet, /\/mobile\/(kitchen|storage|budget)-scene\.webp/)
    }
    const divs = nodes(tree, 'div')
    for (const layer of ['image', 'content']) assert.ok(divs.some(x => x.props['data-campaign-layer'] === layer))
    assert.match(text(tree), /Illustrative room scenes/)
  }
})
test('Desktop and dedicated mobile masters are genuine WebP assets', () => {
  for (const id of ['kitchen', 'storage', 'budget']) for (const prefix of ['', 'mobile/']) {
    const b = fs.readFileSync(path.join(root, `public/home/banners/${prefix}${id}-scene.webp`))
    assert.equal(b.toString('ascii', 0, 4), 'RIFF'); assert.equal(b.toString('ascii', 8, 12), 'WEBP')
  }
})
test('Mobile crop manifest includes fixed dimensions and bounded file size', () => {
  const manifest = JSON.parse(read('public/home/banners/mobile/manifest.json'))
  for (const id of ['kitchen', 'storage', 'budget']) {
    assert.equal(manifest[id].width, 720); assert.equal(manifest[id].height, 600)
    assert.ok(manifest[id].bytes < 60000); assert.match(manifest[id].sourceSha256, /^[a-f0-9]{64}$/)
    assert.ok(manifest[id].crop.width > 0)
  }
})
test('Existing desktop scene masters stay below 80 KB together', () => {
  const total = ['kitchen', 'storage', 'budget'].reduce((sum, id) => sum + fs.statSync(path.join(root, `public/home/banners/${id}-scene.webp`)).size, 0)
  assert.ok(total < 80000)
})
test('Category discoveries retain purpose without repeated benefit rows', () => {
  const tree = EditorialBanners({ products: fixtures })
  assert.match(text(tree), /Practical prep finds for easier everyday cooking/)
  assert.match(text(tree), /Practical storage and organisation/)
  assert.doesNotMatch(text(tree), /For everyday cooking|More room at home|A more organised home/)
})
test('Image containment, reduced motion, focus and store tokens remain', () => {
  const css = read('components/home/editorial-banners.module.css')
  for (const s of ['var(--hf-font-editorial)', 'object-fit', 'prefers-reduced-motion', 'focus-visible', 'var(--hf-border-strong)']) assert.ok(css.includes(s))
  assert.doesNotMatch(css, /rotate\(|!important/)
})
test('Editorial font is page-scoped and preloaded, not in the root layout', () => {
  assert.doesNotMatch(read('app/layout.tsx'), /editorialFont/)
  assert.doesNotMatch(read('lib/storefront/fonts.ts'), /Cormorant_Garamond/)
  const font = read('lib/storefront/editorial-font.ts')
  assert.match(font, /next\/font\/google/); assert.match(font, /preload: true/); assert.match(font, /display: 'swap'/)
  for (const page of ['app/page.tsx', 'app/collections/under-20/page.tsx']) {
    assert.match(read(page), /editorialFont.variable/); assert.match(read(page), /hf-editorial-scope/)
  }
})
test('Font alias resolves in the page scope; UI is not overwritten', () => {
  const css = read('app/campaign-typography.css')
  assert.match(css, /\.hf-editorial-scope \{ --hf-font-editorial: var\(--font-hf-editorial, Georgia\)/)
  assert.match(css, /body \{ font-family: var\(--hf-font-ui\)/)
  assert.doesNotMatch(css, /(?:^|\n)(?:h1|h2|h3|button|input|header)\s*\{/)
})
test('Featured find names the real product; destination keeps editorial type and prices use UI type', () => {
  assert.match(read('components/home/featured-find.tsx'), /id="featured-find-title" className=\{styles.title\}>\{name\}/)
  assert.match(read('app/collections/under-20/page.tsx'), /<h1 className="hf-editorial-title/)
  assert.match(read('components/home/featured-find.module.css'), /\.price \{[^}]*font-family: var\(--hf-font-ui\)/)
  assert.match(read('components/home/featured-find.module.css'), /\.section \.eyebrow \{ color: var\(--featured-muted\)/)
})
test('All discovery paths remain available after the composition redesign', () => {
  const source = read('app/page.tsx')
  assert.match(source, /<Hero products=\{products\} \/>/)
  assert.match(source, /<BudgetShelf products=\{budgetProducts\} \/>/)
  assert.match(source, /<CategoryGrid products=\{products\}/)
  assert.match(source, /<HomeSelection products=\{products\}/)
  assert.match(source, /<HomeCampaigns products=\{products\} featuredProduct=\{featuredProduct\}/)
  assert.match(source, /<HomeClosingBanner products=\{products\}/)
})
test('Interactive edits expose only matching products and real category destinations', () => {
  const { getHomeEdits } = load(path.join(root, 'lib/storefront/home-edits.ts'))
  const edits = getHomeEdits(fixtures)
  assert.equal(edits.length, 2)
  assert.deepEqual(Array.from(edits, edit => edit.slug), ['kitchen-tools', 'space-saving'])
  for (const edit of edits) {
    assert.equal(edit.href, `/shop?category=${edit.slug}`)
    assert.equal(edit.count, 1)
    assert.equal(edit.products.length, 1)
    assert.equal(edit.products[0].id, edit.slug === 'kitchen-tools' ? 1 : 2)
  }
  assert.equal(getHomeEdits([]).length, 0)
})

test('Listing photography uses only existing product images, with safe fallback', () => {
  const { merchandisingImages } = load(path.join(root, 'lib/storefront/merchandising-images.ts'))
  const images = [{ id: 404, src: '/original.webp' }, { id: 406, src: '/real-alternate.webp' }]
  const selected = merchandisingImages({ ...fixtures[0], id: 430, images })
  assert.equal(selected[0], images[1])
  assert.equal(selected.length, images.length)
  assert.equal(images[0].id, 404)
  assert.deepEqual(Array.from(merchandisingImages({ ...fixtures[0], id: 430, images: [images[0]] })), [images[0]])
})
for (const filename of ['components/home/editorial-banners.tsx', 'components/home/featured-find.tsx', 'app/page.tsx', 'app/layout.tsx', 'app/collections/under-20/page.tsx', 'lib/storefront/fonts.ts', 'lib/storefront/editorial-font.ts']) {
  test(`TSX syntax: ${filename}`, () => {
    const result = ts.transpileModule(read(filename), { fileName: filename, compilerOptions: { jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true })
    assert.equal((result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0)
  })
}
console.log(`${passed} home checks passed.`)
module.exports = { EditorialBanners, jsx, fixtures }
