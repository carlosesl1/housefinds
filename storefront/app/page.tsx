import { getProductReviews, getProducts } from '@/lib/woocommerce/client'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { editorialFont } from '@/lib/storefront/editorial-font'
import { planHomeProducts } from '@/lib/storefront/home-products'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { HomeSelection } from '@/components/home/home-selection'
import { HomeCampaigns, HomeClosingBanner } from '@/components/home/home-campaigns'
import { BudgetShelf } from '@/components/home/budget-shelf'
import { ProductReviewHighlights } from '@/components/home/product-review-highlights'
import { Reveal } from '@/components/home/reveal'

export default async function HomePage() {
  const [rawProducts, reviews] = await Promise.all([
    getProducts({ per_page: 16 }).catch(() => []),
    getProductReviews(undefined, 8).catch(() => []),
  ])
  const products = dedupeStoreProducts(rawProducts)
  const { featuredProduct, leadProducts, budgetProducts } = planHomeProducts(products)

  return (
    <main className={`${editorialFont.variable} hf-editorial-scope hf-editorial-home hf-home`}>
      <Hero products={products} />
      <CategoryGrid products={products} />
      <Reveal><HomeSelection products={products} leadProducts={leadProducts} /></Reveal>
      <Reveal><HomeCampaigns products={products} featuredProduct={featuredProduct} /></Reveal>
      <Reveal><BudgetShelf products={budgetProducts} /></Reveal>
      <Reveal><HomeClosingBanner products={products} /></Reveal>
      <ProductReviewHighlights products={products} reviews={reviews} />
    </main>
  )
}
