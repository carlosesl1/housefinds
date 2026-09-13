import Link from 'next/link'
import {
  ArrowRightIcon,
  CubeTransparentIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline'
import { getProducts } from '@/lib/woocommerce/client'
import { findProductByKeywords } from '@/lib/woocommerce/presentation'
import { STORE_CATEGORIES } from '@/lib/storefront/categories'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { FeaturedFind } from '@/components/home/featured-find'
import { ProblemSolvingPicks } from '@/components/home/problem-solving-picks'
import { ProductCard } from '@/components/product/product-card'

export default async function HomePage() {
  const products = await getProducts({ per_page: 16 })
  const featuredProduct =
    findProductByKeywords(products, ['spoon scale']) ||
    findProductByKeywords(products, ['motion sensor led']) ||
    products[0]

  const showcaseProducts = products.filter((product) => product.id !== featuredProduct?.id).slice(0, 8)

  return (
    <main className="overflow-hidden">
      <Hero products={products} />
      <CategoryGrid products={products} />

      {showcaseProducts.length > 0 && (
        <section className="bg-[#fbfaf7] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">New arrivals</p>
                <h2 className="mt-5 text-[clamp(3.5rem,5.6vw,6.5rem)] font-semibold leading-[.9] tracking-[-.065em]">Fresh finds for<br /><span className="text-[#557562]">a brighter home.</span></h2>
              </div>
              <div className="max-w-md">
                <p className="text-lg leading-8 text-black/48">The latest useful products added to Housefinds — chosen for practical everyday living.</p>
                <Link href="/shop?sort=new" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#355f4a]">View all new arrivals <ArrowRightIcon className="size-4" /></Link>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {showcaseProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      <ProblemSolvingPicks products={products} />
      <FeaturedFind product={featuredProduct} />

      <section className="bg-[#f0f1eb] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">The Housefinds filter <span className="h-px w-16 bg-black/15" /></div>
              <h2 className="mt-5 text-[clamp(3.6rem,5.5vw,6.6rem)] font-semibold leading-[.89] tracking-[-.065em] text-[#0e1420]">We are not here to fill your house.</h2>
              <p className="mt-7 max-w-xl text-xl leading-8 text-black/48">The idea is simple: find products that solve a small annoyance, save a little time or make a space work better.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: RectangleGroupIcon, number: '01', title: 'Useful first', copy: 'A product should solve something real before it earns a place in the store.' },
                { icon: LightBulbIcon, number: '02', title: 'Clever, not complicated', copy: 'The best finds usually make sense in seconds and fit naturally into everyday life.' },
                { icon: CubeTransparentIcon, number: '03', title: 'Worth the space', copy: 'We look for practical ideas that feel like an upgrade, not just another object.' },
              ].map(({ icon: Icon, number, title, copy }) => (
                <article key={number} className="flex min-h-[390px] flex-col justify-between rounded-[32px] bg-white p-7 shadow-[0_16px_60px_rgba(31,42,34,.04)]">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[.25em] text-black/32">{number}</span><span className="grid size-12 place-items-center rounded-2xl bg-[#e8efe9] text-[#456b55]"><Icon className="size-6" /></span></div>
                  <div><h3 className="text-3xl font-semibold tracking-[-.045em]">{title}</h3><p className="mt-4 text-[15px] leading-6 text-black/48">{copy}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[42px] bg-[#e2e8e2]">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="px-7 py-16 sm:px-10 lg:px-16 lg:py-20">
              <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">Three ways to find a product</p>
              <h2 className="mt-5 max-w-3xl text-[clamp(3.5rem,5.4vw,6.2rem)] font-semibold leading-[.9] tracking-[-.065em]">Browse. Search.<br /><span className="text-[#557562]">Or start with the problem.</span></h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-black/48">Use categories when you want to explore, search when you know roughly what you need, or open a curated problem-solving pick for a more direct route.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="inline-flex h-13 items-center gap-2 rounded-full bg-[#355f4a] px-6 font-semibold text-white">Browse all <ArrowRightIcon className="size-4" /></Link>
                <Link href="/search" className="inline-flex h-13 items-center gap-2 rounded-full border border-black/10 bg-white px-6 font-semibold"><MagnifyingGlassIcon className="size-4" /> Search products</Link>
              </div>
            </div>

            <div className="bg-[#d3dfd6] px-7 py-12 sm:px-10 lg:px-14 lg:py-16">
              <p className="text-sm font-semibold text-black/55">Popular starting points</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {STORE_CATEGORIES.map((category) => (
                  <Link key={category.slug} href={`/shop?category=${category.slug}`} className="rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white">
                    <p className="font-semibold text-[#172018]">{category.title}</p>
                    <p className="mt-2 text-sm leading-5 text-black/45">{category.copy}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
