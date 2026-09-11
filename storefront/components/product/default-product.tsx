import Image from 'next/image'
import type { WooProduct } from '@/lib/woocommerce/types'
import { AddToCart } from '@/components/cart/add-to-cart'
import { formatMoney } from '@/lib/woocommerce/money'

export function DefaultProduct({ product }: { product: WooProduct }) {
  return (
    <main className="mx-auto max-w-[1480px] px-5 py-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div className="grid grid-cols-2 gap-3">
          {product.images?.map((image, index) => (
            <div
              key={image.id || index}
              className={`relative overflow-hidden rounded-[28px] bg-[#efede7] ${index === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`}
            >
              <Image
                src={image.src}
                alt={image.alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 55vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs uppercase tracking-[.28em] text-black/45">Housefinds</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[.95] tracking-[-.055em]">{product.name}</h1>
          {product.review_count > 0 && (
            <p className="mt-5 text-sm text-black/50">★ {product.average_rating} · {product.review_count} reviews</p>
          )}
          <p className="mt-6 text-3xl font-semibold">
            {formatMoney(product.prices.price, product.prices.currency_minor_unit, product.prices.currency_symbol)}
          </p>
          <div
            className="prose mt-6 max-w-none text-black/55"
            dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}
          />
          <div className="mt-8">
            <AddToCart
              productId={product.id}
              disabled={!product.is_purchasable || !product.is_in_stock}
              label={product.is_in_stock ? 'Add to cart' : 'Out of stock'}
            />
          </div>
          <div className="mt-8 grid gap-3 border-t border-black/10 pt-6 text-sm text-black/50">
            <span>✓ Secure checkout</span>
            <span>✓ Order tracking</span>
            <span>✓ Support when you need it</span>
          </div>
        </div>
      </div>
    </main>
  )
}
