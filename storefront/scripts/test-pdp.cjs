const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const assert = require('node:assert/strict')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const cache = new Map()
let passed = 0
function test(name, run) { run(); passed++; console.log(`PASS ${name}`) }
function loadTs(filename) {
  filename = path.resolve(filename)
  if (cache.has(filename)) return cache.get(filename).exports
  const source = fs.readFileSync(filename, 'utf8')
  const result = ts.transpileModule(source, { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
  const module = new Module(filename, moduleRoot)
  cache.set(filename, module)
  module.filename = filename
  module.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = module.require.bind(module)
  module.require = (request) => {
    if (request.startsWith('@/') || request.startsWith('.')) {
      const base = request.startsWith('@/') ? path.join(root, request.slice(2)) : path.resolve(path.dirname(filename), request)
      for (const file of [base, `${base}.ts`, path.join(base, 'index.ts')]) {
        if (fs.existsSync(file) && fs.statSync(file).isFile() && file.endsWith('.ts')) return loadTs(file)
      }
    }
    return originalRequire(request)
  }
  module._compile(result.outputText, filename)
  return module.exports
}
const moduleRoot = module
const { getProductContent, dimensionOptions, ratingFill, approvedProductVideo } = loadTs(path.join(root, 'lib/storefront/product-content.ts'))

test('known product content requires exact ID and a matching model name', () => {
  assert.ok(getProductContent({ id: 399, name: 'Automatic Door Closer' }))
  assert.equal(getProductContent({ id: 9999, name: 'Automatic Door Closer' }), undefined)
  assert.equal(getProductContent({ id: 399, name: 'Completely different item' }), undefined)
})
test('dimensions use listed centimetre options, sort and deduplicate', () => {
  assert.deepEqual(dimensionOptions(['28 x 39cm', '15 x 24cm', '15 × 24 cm']).map((item) => item.label), ['15 × 24 cm', '28 × 39 cm'])
  assert.equal(dimensionOptions(['40cm X 60cm'])[0].width, 40)
  assert.deepEqual(dimensionOptions(['800g force', '300ml', 'Ships From China', '-4 x 8cm', '0 x 12cm', '600 x 12cm', '20 x 30']), [])
})
test('star fill reflects fractional rating, not five hard-coded full stars', () => {
  const result = ratingFill(4.2)
  assert.deepEqual(result.slice(0, 4), [100, 100, 100, 100])
  assert.ok(Math.abs(result[4] - 20) < 0.00001)
  assert.deepEqual(ratingFill(NaN), [0, 0, 0, 0, 0])
  assert.deepEqual(ratingFill(20), [100, 100, 100, 100, 100])
})
test('unconfirmed video IDs never become playable assets', () => {
  assert.equal(approvedProductVideo(), undefined)
  for (const src of ['5000143794066', 'javascript:alert(1)', 'https://example.com/demo.mp4']) {
    assert.equal(approvedProductVideo({ src, poster: '/media/poster.webp', title: 'Demo', transcript: 'Actual demonstration' }), undefined)
  }
})
test('reviewed video needs a valid first-party poster and written alternative', () => {
  const valid = { src: '/media/demo.mp4', poster: '/media/demo.webp', title: 'Product demonstration', transcript: 'A written demonstration.' }
  assert.deepEqual(approvedProductVideo(valid), valid)
  assert.equal(approvedProductVideo({ ...valid, transcript: '' }), undefined)
  assert.equal(approvedProductVideo({ ...valid, poster: 'https://tracker.invalid/p.gif' }), undefined)
  assert.equal(approvedProductVideo({ ...valid, src: '/media/../demo.mp4' }), undefined)
})
test('source conflicts are not presented as verified specifications', () => {
  const spoon = getProductContent({ id: 333, name: 'Mini Spoon Scale' })
  assert.ok(spoon.guide.points.some((point) => /conflicting/.test(point.value)))
  assert.ok(!spoon.facts.some((fact) => /500g|1kg|0.1g/i.test(fact.value)))
  const board = getProductContent({ id: 452, name: 'Cutting Board' })
  assert.ok(!board.facts.some((fact) => /0.7mm|30.*46/.test(fact.value)))
  assert.ok(board.included.includes('One'))
})
test('specific product content includes actual care and packaging distinctions', () => {
  assert.match(getProductContent({ id: 430, name: 'Oil Spray Bottle' }).care, /dishwasher/)
  assert.match(getProductContent({ id: 382, name: 'Toothbrush Holder' }).included, /One or two/)
  assert.match(getProductContent({ id: 357, name: 'Shoe Washing Bag' }).care, /inside out/)
})
test('all changed TSX files parse without syntax errors', () => {
  for (const name of ['default-product', 'product-faq', 'product-gallery', 'product-option-guide', 'product-rating']) {
    const file = path.join(root, 'components/product', `${name}.tsx`)
    const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } })
    assert.equal((result.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error).length, 0, name)
  }
})
test('gallery has visible mobile thumbnails, dialog portal and on-demand video', () => {
  const source = fs.readFileSync(path.join(root, 'components/product/product-gallery.tsx'), 'utf8')
  assert.ok(source.includes('createPortal(') && source.includes('dialog.showModal()'))
  assert.ok(source.includes('ref={stripRef}') && !source.includes('hidden items-stretch'))
  assert.ok(source.includes('preload="none"') && !source.includes('autoPlay'))
  assert.ok(source.includes('Math.abs(dy) * 1.4') && source.includes('suppressClick.current'))
})
if (!process.argv.includes('--content-only')) {
  const { toPurchaseProduct, toPurchaseVariations } = loadTs(path.join(root, 'lib/storefront/client-product.ts'))
  const prices = { price: '100', regular_price: '100', sale_price: '', currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2, currency_decimal_separator: '.', currency_thousand_separator: ',', currency_prefix: '£', currency_suffix: '' }
  const attribute = (name, value) => ({ id: 0, name, has_variations: true, terms: [{ id: 0, name: value, slug: value }] })
  const product = { id: 333, name: 'Mini Spoon Scale', slug: 'spoon', prices, description: 'supplier text', sku: 'internal', attributes: [attribute('Color', 'White'), attribute('Load Bearing', '1Kg'), attribute('Ships From', 'China Mainland')], variations: [{ id: 334, attributes: [{ name: 'Color', value: 'White' }, { name: 'Load Bearing', value: '1Kg' }, { name: 'Ships From', value: 'China Mainland' }] }], images: [], is_purchasable: true, is_in_stock: true }
  test('public variant matching keeps exact ID but excludes internal and conflicting constants', () => {
    const clean = toPurchaseProduct(product)
    assert.deepEqual(clean.attributes.map((item) => item.name), ['Color'])
    assert.equal(clean.variations[0].id, 334)
    assert.deepEqual(clean.variations[0].attributes, [{ name: 'Color', value: 'White' }])
    assert.ok(!JSON.stringify(clean).includes('China Mainland'))
    assert.ok(!('sku' in clean) && !('description' in clean))
    assert.equal(product.attributes.length, 3)
  })
  test('other models retain their original non-operational attributes', () => {
    const clean = toPurchaseProduct({ ...product, id: 777 })
    assert.ok(clean.attributes.some((item) => item.name === 'Load Bearing'))
  })
  test('shared generic variation images are not labelled as colour-specific', () => {
    const variant = (id, src) => ({ ...product, id, images: [{ id, src }] })
    assert.ok(toPurchaseVariations([variant(1, 'same.webp'), variant(2, 'same.webp')]).every((item) => !item.image))
    const distinct = toPurchaseVariations([variant(1, 'white.webp'), variant(2, 'black.webp')])
    assert.equal(distinct[0].image.src, 'white.webp')
    assert.equal(distinct[1].image.src, 'black.webp')
  })
}
console.log(`PDP checks: ${passed} passed. Payment and live checkout are not exercised by this suite.`)
