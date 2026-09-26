import { getProductReviews, getProducts } from '@/lib/woocommerce/client'
import { findProductByKeywords } from '@/lib/woocommerce/presentation'
import { dedupeStoreProducts } from '@/lib/storefront/catalog'
import { editorialFont } from '@/lib/storefront/editorial-font'
import { Hero } from '@/components/home/hero'
import { StoreBenefits } from '@/components/home/store-benefits'
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
  const featuredProduct = findProductByKeywords(products, ['spoon scale']) || findProductByKeywords(products, ['motion sensor led']) || products[0]
  // Introduce other everyday uses in the second selection; pricing eligibility stays shared.
  const budgetProducts = [...products.filter(p => !/oil spray|spoon scale|cutting board|door closer|toothbrush holder/i.test(p.name)), ...products]
    .filter((product, index, all) => all.findIndex(item => item.id === product.id) === index)

  return (
    <main className={`${editorialFont.variable} hf-editorial-scope hf-editorial-home hf-home`}>
      <Hero products={products} />
      <StoreBenefits />
      <CategoryGrid products={products} />
      <Reveal><HomeSelection products={products} /></Reveal>
      <Reveal><HomeCampaigns products={products} featuredProduct={featuredProduct} /></Reveal>
      <Reveal><BudgetShelf products={budgetProducts} /></Reveal>
      <Reveal><HomeClosingBanner products={products} /></Reveal>
      <ProductReviewHighlights products={products} reviews={reviews} />
    </main>
  )
}
