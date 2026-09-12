const WC_URL = (process.env.WOOCOMMERCE_URL || 'https://housefindsstore.com').replace(/\/$/, '')

export async function GET() {
  try {
    const response = await fetch(`${WC_URL}/checkout/`, {
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'text/html,application/xhtml+xml' },
    })
    const html = await response.text()
    const keys = Array.from(new Set(html.match(/pk_(?:test|live)_[A-Za-z0-9]+/g) || []))
    return Response.json({
      status: response.status,
      finalUrl: response.url,
      stripeDetected: /stripe/i.test(html),
      publishableKeys: keys,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
