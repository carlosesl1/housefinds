import { permanentRedirect } from 'next/navigation'
import { getProductByStorefrontSlug } from '@/lib/woocommerce/client'
import { storefrontProductSlug } from '@/lib/woocommerce/presentation'

export default async function LegacyProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductByStorefrontSlug(slug).catch(() => null)
  permanentRedirect(`/product/${product ? storefrontProductSlug(product) : slug}`)
}
