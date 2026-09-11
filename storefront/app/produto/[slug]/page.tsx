import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/woocommerce/client'
import { DefaultProduct } from '@/components/product/default-product'
import { AuroraProjectorExperience } from '@/experiences/aurora-projector'
import { experienceRegistry } from '@/experiences/registry'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return { title: product.name, description: product.short_description?.replace(/<[^>]+>/g, '').slice(0, 155) }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const experience = experienceRegistry[slug]
  if (experience === 'aurora-projector') return <AuroraProjectorExperience product={product}/>
  return <DefaultProduct product={product}/>
}
