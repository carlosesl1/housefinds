import { NextRequest } from 'next/server'
import { getProducts } from '@/lib/woocommerce/client'
import { searchStoreProducts } from '@/lib/storefront/search'
import { displayProductName, displayProductTagline } from '@/lib/woocommerce/presentation'
import { formatProductPrice } from '@/lib/woocommerce/money'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() || ''
  if (query.length < 2) return Response.json({ results: [] })

  const products = await getProducts({ per_page: 100 })
  const results = searchStoreProducts(products, query).slice(0, 6).map((product) => ({
    id: product.id,
    name: displayProductName(product.name),
    slug: product.slug,
    tagline: displayProductTagline(product),
    price: formatProductPrice(product),
    image: product.images?.[0]?.thumbnail || product.images?.[0]?.src || '',
  }))

  return Response.json(
    { results },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
