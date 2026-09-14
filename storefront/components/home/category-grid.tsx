import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { STORE_CATEGORIES, getCategoryProduct } from '@/lib/storefront/categories'

export function CategoryGrid({ products }: { products: WooProduct[] }) {
  return (
    <section className="hf-section bg-[var(--hf-background)]">
      <div className="hf-container">
        <div className="grid gap-7 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="hf-eyebrow">Shop by category</p>
            <h2 className="hf-section-title mt-5 max-w-[900px]">
              Start with the room. <span className="text-[var(--hf-brand-muted)]">Find the useful bit.</span>
            </h2>
          </div>
          <p className="hf-copy-lg max-w-md lg:justify-self-end">
            Browse practical upgrades by the part of everyday home life you want to make easier.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          {STORE_CATEGORIES.map((category, index) => {
            const product = getCategoryProduct(products, category, index)
            const image = product?.images?.[0]
            const wide = index === 0 || index === 3

            return (
              <Link
                href={`/shop?category=${category.slug}`}
                key={category.slug}
                className={`group overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] ${category.tone} transition duration-300 hover:-translate-y-1 hover:shadow-[var(--hf-shadow-soft)] ${wide ? 'xl:col-span-7' : 'xl:col-span-5'}`}
              >
                <div className={`relative overflow-hidden bg-black/[.035] ${wide ? 'aspect-[16/9]' : 'aspect-[5/4]'}`}>
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || `${category.title} products`}
                      fill
                      sizes={wide ? '(max-width: 1280px) 50vw, 58vw' : '(max-width: 1280px) 50vw, 42vw'}
                      className="object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(255,255,255,.75),transparent_32%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />
                </div>

                <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end lg:p-7">
                  <div>
                    <h3 className="text-[clamp(1.7rem,2.2vw,2.35rem)] font-semibold tracking-[-.04em] text-[var(--hf-ink)]">{category.title}</h3>
                    <p className="mt-2 max-w-xl text-[15px] leading-6 text-black/52">{category.copy}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--hf-brand)]">Browse <ArrowUpRightIcon className="size-4" /></span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
