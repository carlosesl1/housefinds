import { getProducts } from '@/lib/woocommerce/client'
import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { ProductCard } from '@/components/product/product-card'

export default async function HomePage() {
  const products = await getProducts({ per_page: 12 })

  return (
    <main>
      <Hero products={products} />
      <CategoryGrid />

      <section className="mx-auto max-w-[1480px] px-5 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[.28em] text-black/45">Best sellers</p>
            <h2 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-.055em] md:text-7xl">
              Everyday solutions, <span className="text-[#507561]">happier homes.</span>
            </h2>
          </div>
          <p className="max-w-md text-lg leading-7 text-black/50">
            Discover useful products designed to make everyday life a little easier.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-[#eff1eb]">
        <div className="mx-auto max-w-[1480px] px-5 py-24 text-center lg:px-8">
          <p className="text-xs uppercase tracking-[.28em] text-black/45">Why Housefinds</p>
          <h2 className="mx-auto mt-4 max-w-5xl text-5xl font-semibold tracking-[-.055em] md:text-7xl">
            Small finds. <span className="text-[#507561]">A bigger, happier home.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/50">
            Practical, well-designed home products chosen to make everyday living a little better.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ['Carefully curated', 'Useful products selected for modern living.'],
              ['Simple to use', 'Clear, practical products without unnecessary complexity.'],
              ['Everyday value', 'Small solutions that make a real difference at home.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[28px] bg-white p-8 text-left">
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-black/50">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
