import { getProducts } from '@/lib/woocommerce/client'
import { ProductCard } from '@/components/product/product-card'

export const metadata = { title: 'Shop' }

export default async function ShopPage() {
  const products = await getProducts({ per_page: 24 })

  return (
    <main className="mx-auto max-w-[1480px] px-5 py-16 lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[.28em] text-black/45">Housefinds collection</p>
        <h1 className="mt-4 text-6xl font-semibold tracking-[-.06em] md:text-8xl">
          Clever finds<br />
          <span className="text-[#507561]">for everyday living.</span>
        </h1>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  )
}
