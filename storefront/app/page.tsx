import Link from 'next/link'
import {
  ArrowRightIcon,
  CubeTransparentIcon,
  LightBulbIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline'
import { getProducts } from '@/lib/woocommerce/client'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { FeaturedFind } from '@/components/home/featured-find'
import { ProductCard } from '@/components/product/product-card'

export default async function HomePage() {
  const products = await getProducts({ per_page: 12 })
  const additionalProducts = products.slice(1)

  return (
    <main className="overflow-hidden">
      <Hero products={products} />
      <CategoryGrid />
      <FeaturedFind product={products[0]} />

      {additionalProducts.length > 0 && (
        <section className="bg-[#fbfaf7] px-6 py-28 lg:px-10 lg:py-36">
          <div className="mx-auto max-w-[1600px]">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">More clever finds</p>
                <h2 className="mt-5 text-[clamp(3.5rem,5.6vw,6.5rem)] font-semibold leading-[.9] tracking-[-.065em]">
                  Useful enough to keep.<br />
                  <span className="text-[#557562]">Different enough to notice.</span>
                </h2>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-2 pb-2 font-semibold text-[#355f4a]">
                View all products <ArrowRightIcon className="size-4" />
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {additionalProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#f0f1eb] px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">
                The Housefinds filter <span className="h-px w-16 bg-black/15" />
              </div>
              <h2 className="mt-5 text-[clamp(3.6rem,5.5vw,6.6rem)] font-semibold leading-[.89] tracking-[-.065em] text-[#0e1420]">
                We are not here to fill your house.
              </h2>
              <p className="mt-7 max-w-xl text-xl leading-8 text-black/48">
                The idea is simple: find products that solve a small annoyance, save a little time or make a space work better.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: RectangleGroupIcon,
                  number: '01',
                  title: 'Useful first',
                  copy: 'A product should solve something real before it earns a place in the store.',
                },
                {
                  icon: LightBulbIcon,
                  number: '02',
                  title: 'Clever, not complicated',
                  copy: 'The best finds usually make sense in seconds and fit naturally into everyday life.',
                },
                {
                  icon: CubeTransparentIcon,
                  number: '03',
                  title: 'Worth the space',
                  copy: 'We look for practical ideas that feel like an upgrade, not just another object.',
                },
              ].map(({ icon: Icon, number, title, copy }) => (
                <article key={number} className="flex min-h-[390px] flex-col justify-between rounded-[32px] bg-white p-7 shadow-[0_16px_60px_rgba(31,42,34,.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[.25em] text-black/32">{number}</span>
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#e8efe9] text-[#456b55]">
                      <Icon className="size-6" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-.045em]">{title}</h3>
                    <p className="mt-4 text-[15px] leading-6 text-black/48">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1600px] overflow-hidden rounded-[42px] bg-[#e2e8e2]">
          <div className="grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="px-7 py-16 sm:px-10 lg:px-16 lg:py-20">
              <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">Stay in the know</p>
              <h2 className="mt-5 max-w-3xl text-[clamp(3.5rem,5.6vw,6.5rem)] font-semibold leading-[.9] tracking-[-.065em]">
                Clever finds,<br />
                <span className="text-[#557562]">when they are worth sharing.</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-black/48">
                New products, useful ideas and Housefinds updates — without filling your inbox with noise.
              </p>
            </div>

            <div className="flex items-center bg-[#d3dfd6] px-7 py-12 sm:px-10 lg:px-14">
              <div className="w-full rounded-[30px] bg-white/75 p-6 backdrop-blur sm:p-8">
                <p className="text-sm font-semibold">Join the Housefinds list</p>
                <form className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="h-14 min-w-0 flex-1 rounded-full border border-black/10 bg-white px-5 outline-none placeholder:text-black/32 focus:border-[#557562]"
                  />
                  <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#355f4a] px-7 font-semibold text-white">
                    Subscribe <ArrowRightIcon className="size-4" />
                  </button>
                </form>
                <p className="mt-4 text-xs leading-5 text-black/38">No spam. Just useful product discoveries and occasional store updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
