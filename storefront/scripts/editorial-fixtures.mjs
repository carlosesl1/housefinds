// Read-only local Woo fixture for visual regression. Never imported by the app.
import http from 'node:http'
const catalogue = [
  ['Oil Spray Bottle', 'oil-spray-bottle', 'kitchen', '850'],
  ['Stainless Steel Cutting Board', 'stainless-steel-cutting-board', 'kitchen', '1200'],
  ['Automatic Sensor Door Closer', 'automatic-sensor-door-closer', 'budget', '575'],
  ['Covered Toothbrush Holder', 'covered-toothbrush-holder', 'storage', '399'],
  ['Shoe Washing Bag', 'shoe-washing-bag', 'storage', '497'],
  ['Motion Sensor LED Bar Light', 'motion-sensor-led-bar-light', 'budget', '1593'],
  ['Digital Spoon Scale', 'digital-spoon-scale', 'kitchen', '795'],
].map(([name, slug, scene, price], index) => ({
  id: 91001 + index, name, slug, parent: 0, type: 'simple', variation: '',
  permalink: `http://127.0.0.1:3000/product/${slug}`, sku: '',
  short_description: '', description: '', on_sale: false,
  prices: { price, regular_price: price, sale_price: '', price_range: null,
    currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2,
    currency_decimal_separator: '.', currency_thousand_separator: ',', currency_prefix: '£', currency_suffix: '' },
  average_rating: '0', review_count: 0,
  images: [{ id: index + 1, src: `/home/banners/${scene}-scene.webp`, alt: 'Visual QA fixture image' }],
  categories: [], attributes: [], variations: [], has_options: false,
  is_purchasable: true, is_in_stock: true,
  add_to_cart: { minimum: 1, maximum: 10, multiple_of: 1 },
}))
const cart = { items: [], coupons: [], totals: { total_price: '0', total_items: '0', total_items_tax: '0', total_discount: '0', total_shipping: '0', total_tax: '0', currency_code: 'GBP', currency_symbol: '£', currency_minor_unit: 2 },
  needs_payment: false, needs_shipping: false, has_calculated_shipping: false, shipping_rates: [], items_count: 0 }
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'GET') { res.writeHead(405); res.end(JSON.stringify({ error: 'QA is read-only' })); return }
  const url = new URL(req.url, 'http://127.0.0.1:4010')
  if (url.pathname.endsWith('/products/reviews')) { res.end('[]'); return }
  if (url.pathname.endsWith('/products')) {
    const slug = url.searchParams.get('slug')
    const result = url.searchParams.has('parent') ? [] : slug ? catalogue.filter(p => p.slug === slug) : catalogue
    res.end(JSON.stringify(result)); return
  }
  if (url.pathname.endsWith('/cart')) { res.end(JSON.stringify(cart)); return }
  if (url.pathname === '/health') { res.end('{"ready":true}'); return }
  res.writeHead(404); res.end('{"error":"Not a fixture route"}')
}).listen(4010, '127.0.0.1', () => console.log('Read-only visual QA fixtures ready on 4010'))
