import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { STORE_CATEGORIES, getCategoryProduct } from '@/lib/storefront/categories'
import { HOME_CATEGORY_BG, PAPER_TEXTURE } from '@/lib/storefront/home-backgrounds'

export function CategoryGrid({ products }: { products: WooProduct[] }) {
  return (
    <section
      className="hf-section relative overflow-hidden bg-[var(--hf-background)]"
      style={{
        backgroundImage: `linear-gradient(rgba(251,250,247,.76), rgba(251,250,247,.86)), url("${HOME_CATEGORY_BG}"), url("${PAPER_TEXTURE}")`,
        backgroundPosition: 'center, center, center',
        backgroundRepeat: 'no-repeat, no-repeat, repeat',
        backgroundSize: 'cover, cover, 192px 192px',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      <div className="hf-container relative">
        <div className="grid gap-7 lg:grid-cols-[1fr_390px] lg:items-end">
          <div>
            <p className="hf-eyebrow">Shop by category</p>
            <h2 className="hf-section-title mt-5 max-w-[880px]">
              Start with the room. <span className="text-[var(--hf-brand-muted)]">Find the useful bit.</span>
            </h2>
          </div>
          <p className="hf-copy-lg max-w-md lg:justify-self-end lg:pb-1">
            Browse practical upgrades by the part of everyday home life you want to make easier.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
          {STORE_CATEGORIES.map((category, index) => {
            const product = getCategoryProduct(products, category, index)
            const image = product?.images?.[0]

            return (
              <Link
                href={`/shop?category=${category.slug}`}
                key={category.slug}
                className={`group overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] ${category.tone} shadow-[0_16px_45px_rgba(38,52,42,.055)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[var(--hf-shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hf-brand-muted)]`}
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-black/[.035]">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || `${category.title} products`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(255,255,255,.75),transparent_32%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/[.04]" />

                  <span className="absolute left-4 top-4 inline-flex min-h-9 items-center rounded-[var(--hf-radius-pill)] border border-white/55 bg-white/88 px-3 text-[10px] font-bold tracking-[.18em] text-black/52 shadow-sm backdrop-blur">
                    0{index + 1}
                  </span>
                  <span className="hf-icon-button absolute right-4 top-4 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">
                    <ArrowUpRightIcon className="size-4" />
                  </span>
                </div>

                <div className="flex min-h-[190px] flex-col border-t border-white/35 bg-white/[.22] p-6 backdrop-blur-[2px] lg:p-7">
                  <h3 className="text-[clamp(1.75rem,2vw,2.15rem)] font-semibold tracking-[-.04em] text-[var(--hf-ink)]">{category.title}</h3>
                  <p className="mt-3 text-[15px] leading-6 text-black/52">{category.copy}</p>
                  <span className="hf-button-tertiary mt-auto w-fit translate-y-0 pt-[.64rem] group-hover:bg-white">
                    Browse <ArrowUpRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
