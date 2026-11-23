// Local, read-only catalogue scenarios. Never imported by the storefront.
import http from 'node:http'

export const catalogue = [
  ['Oil Spray Bottle', 'oil-spray-bottle', '850', 'kitchen'],
  ['Stainless Steel Cutting Board', 'stainless-steel-cutting-board', '1200', 'kitchen'],
  ['Covered Toothbrush Holder', 'covered-toothbrush-holder', '399', 'storage'],
  ['Automatic Sensor Door Closer', 'automatic-sensor-door-closer', '575', 'storage'],
  ['Motion Sensor LED Bar Light', 'motion-sensor-led-bar-light', '1593', 'budget'],
  ['Shoe Washing Bag', 'shoe-washing-bag', '2500', 'budget'],
].map(([name, slug, price, scene], index) => ({
  id: 92001 + index, name, slug, parent: 0, type: 'simple', variation: '',
  permalink: `http://127.0.0.1:3015/product/${slug}`, sku: '', short_description: '', description: '', on_sale: false,
  prices: { price, regular_price: price, sale_price: '', price_range: null,
    currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2,
    currency_decimal_separator: '.', currency_thousand_separator: ',', currency_prefix: '£', currency_suffix: '' },
  average_rating: '0', review_count: 0,
  images: [{ id: index + 1, src: `/home/banners/${scene}-scene.webp`, alt: 'Local catalogue test image' }],
  categories: [], attributes: [], variations: [], has_options: false,
  is_purchasable: true, is_in_stock: index !== 4, add_to_cart: { minimum: 1, maximum: 10, multiple_of: 1 },
}))
catalogue[1].type = 'variable'
catalogue[1].has_options = true
catalogue[1].prices.price_range = { min_amount: '900', max_amount: '2100' }
catalogue[1].attributes = [{ id: 1, name: 'Size', has_variations: true, terms: [{ id: 1, name: 'Small', slug: 'small' }, { id: 2, name: 'Large', slug: 'large' }] }]
catalogue[1].variations = [{ id: 92101, attributes: [{ name: 'Size', value: 'small' }] }]

export const emptyCart = { items: [], coupons: [], totals: { total_price: '0', total_items: '0', total_items_tax: '0', total_discount: '0', total_shipping: '0', total_tax: '0', currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2 }, needs_payment: false, needs_shipping: false, has_calculated_shipping: false, shipping_rates: [], items_count: 0 }

// Importing the fixtures in a browser test must not start another server.
if (process.argv[1]?.endsWith('catalog-fixtures.mjs')) http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'GET') { res.writeHead(405); res.end('{"error":"Read-only QA"}'); return }
  const url = new URL(req.url, 'http://127.0.0.1:4016')
  if (url.pathname.endsWith('/products/reviews')) { res.end('[]'); return }
  if (url.pathname.endsWith('/products')) {
    let result = [...catalogue]
    if (url.searchParams.has('parent')) result = []
    if (url.searchParams.has('slug')) result = result.filter(p => p.slug === url.searchParams.get('slug'))
    if (url.searchParams.get('orderby') === 'price') result.sort((a, b) => Number(a.prices.price) - Number(b.prices.price))
    if (url.searchParams.get('order') === 'desc') result.reverse()
    res.end(JSON.stringify(result)); return
  }
  if (url.pathname.endsWith('/cart')) { res.end(JSON.stringify(emptyCart)); return }
  if (url.pathname === '/health') { res.end('{"ready":true}'); return }
  res.writeHead(404); res.end('{"error":"No fixture"}')
}).listen(4016, '127.0.0.1', () => console.log('Catalog QA fixtures ready on 4016 (read-only)'))
