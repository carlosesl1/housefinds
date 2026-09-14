import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TEST_VARIATION_ID = 433

function cartCookie(response: Response) {
  const setCookie = response.headers.get('set-cookie') || ''
  const match = setCookie.match(/(?:^|,\s*)hf_cart_token=([^;]+)/)
  return match ? `hf_cart_token=${match[1]}` : ''
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin

  const initial = await fetch(`${origin}/api/cart`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  const initialCookie = cartCookie(initial)

  const added = await fetch(`${origin}/api/cart?action=add-item`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(initialCookie ? { Cookie: initialCookie } : {}),
    },
    body: JSON.stringify({ id: TEST_VARIATION_ID, quantity: 1 }),
    cache: 'no-store',
  })

  const addedText = await added.text()
  let cart: Record<string, unknown> = {}
  try {
    cart = JSON.parse(addedText) as Record<string, unknown>
  } catch {
    cart = {}
  }

  const items = Array.isArray(cart.items) ? cart.items as Array<Record<string, unknown>> : []
  const item = items.find((candidate) => Number(candidate.id) === TEST_VARIATION_ID)
  const serialized = JSON.stringify(cart).toLowerCase()
  const variation = item && Array.isArray(item.variation) ? item.variation : []
  const keys = item ? Object.keys(item).sort() : []

  const activeCookie = cartCookie(added) || initialCookie
  let cleanupStatus: number | null = null
  if (item?.key && activeCookie) {
    const cleanup = await fetch(`${origin}/api/cart?action=remove-item`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Cookie: activeCookie,
      },
      body: JSON.stringify({ key: item.key }),
      cache: 'no-store',
    })
    cleanupStatus = cleanup.status
  }

  return NextResponse.json({
    initialStatus: initial.status,
    tokenBootstrapped: Boolean(initialCookie),
    addStatus: added.status,
    itemAdded: Boolean(item),
    itemKeys: keys,
    visibleVariation: variation,
    supplierMetadataLeaked: /ships from|china mainland|dsers|\"sku\"/.test(serialized),
    cleanupStatus,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
