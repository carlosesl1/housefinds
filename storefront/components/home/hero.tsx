import Image from 'next/image'
import Link from 'next/link'
import {
  ArchiveBoxIcon,
  ArrowRightIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import {
  displayProductName,
  findProductByKeywords,
  pickHeroProduct,
  storefrontProductSlug,
} from '@/lib/woocommerce/presentation'
import { HOME_HERO_BG, HOME_TRUST_BG, PAPER_TEXTURE } from '@/lib/storefront/home-backgrounds'

function pickImage(product?: WooProduct, preferredIndex = 0) {
  const images = product?.images || []
  return images[preferredIndex] || images[0]
}

function productHref(product?: WooProduct, fallback = '/shop') {
  return product ? `/product/${storefrontProductSlug(product)}` : fallback
}

export function Hero({ products }: { products: WooProduct[] }) {
  const featured = pickHeroProduct(products)
  const kitchenProduct =
    findProductByKeywords(products, ['cutting board']) ||
    findProductByKeywords(products, ['oil spray']) ||
    products.find((product) => product.id !== featured?.id)
  const spaceProduct =
    findProductByKeywords(products, ['shoe rack']) ||
    findProductByKeywords(products, ['toothbrush holder']) ||
    products.find((product) => product.id !== featured?.id && product.id !== kitchenProduct?.id)
  const dailyProduct =
    findProductByKeywords(products, ['motion sensor led']) ||
    findProductByKeywords(products, ['mosquito']) ||
    products.find((product) => ![featured?.id, kitchenProduct?.id, spaceProduct?.id].includes(product.id))

  const featuredImage = pickImage(featured, 1)
  const kitchenImage = pickImage(kitchenProduct, 0)
  const spaceImage = pickImage(spaceProduct, 0)
  const dailyImage = pickImage(dailyProduct, 0)
  const featuredName = featured ? displayProductName(featured.name) : 'Featured find'
  const featuredHref = productHref(featured)

  return (
    <section
      className="relative overflow-hidden border-b border-black/[.06] bg-[#f6f4ee]"
      style={{
        backgroundImage: `linear-gradient(rgba(246,244,238,.72), rgba(246,244,238,.84)), url("${HOME_HERO_BG}"), url("${PAPER_TEXTURE}")`,
        backgroundPosition: 'center, center, center',
        backgroundRepeat: 'no-repeat, no-repeat, repeat',
        backgroundSize: 'cover, cover, 192px 192px',
      }}
    >
      <div className="pointer-events-none absolute left-[-9rem] top-24 h-80 w-80 rounded-full bg-[#dfe9e2]/30 blur-[110px]" />
      <div className="pointer-events-none absolute right-[18%] top-6 h-72 w-72 rounded-full bg-white/42 blur-[100px]" />

      <div className="hf-container relative grid gap-9 py-8 xl:min-h-[650px] xl:grid-cols-[.82fr_1.18fr] xl:items-center xl:gap-12 xl:py-10">
        <div className="flex flex-col justify-center py-6 xl:py-12">
          <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Small changes · Bigger living</p>

          <h1 className="hf-display mt-6 max-w-[760px]">
            Smart finds for a <span className="text-[var(--hf-brand-muted)]">better home.</span>
          </h1>

          <p className="hf-copy-lg mt-7 max-w-[610px]">
            Clever, useful home products chosen to make everyday life simpler, tidier and a little smarter.
          </p>

          <form action="/search" method="get" role="search" className="mt-7 max-w-[610px] xl:hidden">
            <label className="flex min-h-14 items-center gap-3 rounded-[var(--hf-radius-md)] border border-black/[.08] bg-white/92 px-4 shadow-[0_12px_34px_rgba(30,42,34,.05)] backdrop-blur transition focus-within:border-[var(--hf-brand-muted)] focus-within:ring-4 focus-within:ring-[#557562]/10">
              <MagnifyingGlassIcon className="size-5 shrink-0 text-black/38" />
              <span className="sr-only">Search products</span>
              <input
                type="search"
                name="q"
                autoComplete="off"
                placeholder="Search products…"
                className="min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-black/34"
              />
              <button type="submit" className="hf-button-primary hf-button-sm hidden shrink-0 sm:inline-flex">
                Search
              </button>
            </label>
          </form>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="hf-button-primary">
              Shop all products <ArrowRightIcon className="size-4" />
            </Link>
            <Link href="/shop?sort=popular" className="hf-button-secondary">Popular finds</Link>
          </div>

          <div className="mt-9 max-w-[650px] border-t border-black/[.08] pt-5">
            <p className="text-xs font-medium text-black/42">Shop by</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/shop?category=kitchen-tools" className="hf-button-tertiary !min-h-10 gap-2 px-3.5 py-2 text-xs sm:text-sm">
                <Squares2X2Icon className="size-4" /> Kitchen
              </Link>
              <Link href="/shop?category=smart-entry" className="hf-button-tertiary !min-h-10 gap-2 px-3.5 py-2 text-xs sm:text-sm">
                <KeyIcon className="size-4" /> Smart Entry
              </Link>
              <Link href="/shop?category=space-saving" className="hf-button-tertiary !min-h-10 gap-2 px-3.5 py-2 text-xs sm:text-sm">
                <ArchiveBoxIcon className="size-4" /> Space Saving
              </Link>
              <Link href="/shop?category=daily-helpers" className="hf-button-tertiary !min-h-10 gap-2 px-3.5 py-2 text-xs sm:text-sm">
                <SparklesIcon className="size-4" /> Daily Helpers
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.05fr_.95fr]">
          <div className="group relative min-h-[510px] overflow-hidden rounded-[var(--hf-radius-lg)] bg-[#e4e5df] shadow-[0_28px_80px_rgba(40,54,44,.12)] sm:min-h-[590px] xl:min-h-[600px]">
            {featuredImage ? (
              <Image
                src={featuredImage.src}
                alt={featuredImage.alt || featuredName}
                fill
                priority
                sizes="(max-width: 1279px) 100vw, 36vw"
                className="object-cover object-center transition duration-700 group-hover:scale-[1.015]"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,#dfe8e1,transparent_35%),linear-gradient(135deg,#eeeae0,#d9ddd5)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[.04]" />
            <Link href={featuredHref} aria-label={`View ${featuredName}`} className="absolute inset-0 z-10" />

            {featured && (
              <Link
                href={featuredHref}
                aria-label={`View ${featuredName}`}
                className="absolute inset-x-4 bottom-4 z-20 grid cursor-pointer gap-3 rounded-[var(--hf-radius-md)] border border-white/45 bg-white/92 p-4 shadow-[var(--hf-shadow-float)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hf-brand-muted)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[390px] sm:p-5"
              >
                <div>
                  <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Featured find</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight tracking-[-.025em] text-[var(--hf-ink)]">{featuredName}</h2>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-semibold">{formatProductPrice(featured)}</span>
                  <span className="hf-button-primary hf-button-sm pointer-events-none">
                    View find <ArrowRightIcon className="size-3.5" />
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="grid gap-3 sm:grid-rows-[1.03fr_.97fr]">
            <Link
              href={productHref(kitchenProduct, '/shop?category=kitchen-tools')}
              className="group overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white/94 shadow-[0_18px_48px_rgba(40,54,44,.08)] backdrop-blur transition hover:-translate-y-1"
            >
              <div className="relative min-h-[260px] overflow-hidden bg-[#ece9e1] sm:min-h-[300px]">
                {kitchenImage ? (
                  <Image src={kitchenImage.src} alt="Kitchen Tools" fill sizes="(max-width: 1279px) 100vw, 28vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#ede9df,#dde5de)]" />
                )}
              </div>
              <div className="flex items-end justify-between gap-4 border-t border-white/55 bg-white/82 p-5 backdrop-blur-sm">
                <div>
                  <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Kitchen Tools</p>
                  <p className="mt-2 text-sm font-medium leading-5 text-black/58">Smarter prep, simpler living.</p>
                </div>
                <span className="hf-icon-button !size-10 !shadow-none"><ArrowRightIcon className="size-4" /></span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href={productHref(spaceProduct, '/shop?category=space-saving')}
                className="group overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white/94 shadow-[0_16px_40px_rgba(40,54,44,.07)] backdrop-blur transition hover:-translate-y-1"
              >
                <div className="relative min-h-[205px] overflow-hidden bg-[#e8e7df] sm:min-h-[235px]">
                  {spaceImage ? (
                    <Image src={spaceImage.src} alt="Space Saving" fill sizes="(max-width: 1279px) 50vw, 14vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#ece9e0,#dfe4dd)]" />
                  )}
                </div>
                <div className="flex items-end justify-between gap-2 border-t border-white/55 bg-white/82 p-4 backdrop-blur-sm">
                  <div className="min-w-0">
                    <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Space Saving</p>
                    <p className="mt-1.5 text-xs leading-5 text-black/52 sm:text-sm">More space. Less clutter.</p>
                  </div>
                  <span className="hf-icon-button !size-9 !shadow-none"><ArrowRightIcon className="size-3.5" /></span>
                </div>
              </Link>

              <Link
                href={productHref(dailyProduct, '/shop?category=daily-helpers')}
                className="group overflow-hidden rounded-[var(--hf-radius-lg)] border border-black/[.06] bg-white/94 shadow-[0_16px_40px_rgba(40,54,44,.07)] backdrop-blur transition hover:-translate-y-1"
              >
                <div className="relative min-h-[205px] overflow-hidden bg-[#e5e7e1] sm:min-h-[235px]">
                  {dailyImage ? (
                    <Image src={dailyImage.src} alt="Daily Helpers" fill sizes="(max-width: 1279px) 50vw, 14vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#e9ece7,#dfe6df)]" />
                  )}
                </div>
                <div className="flex items-end justify-between gap-2 border-t border-white/55 bg-white/82 p-4 backdrop-blur-sm">
                  <div className="min-w-0">
                    <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Daily Helpers</p>
                    <p className="mt-1.5 text-xs leading-5 text-black/52 sm:text-sm">Small tools. Big difference.</p>
                  </div>
                  <span className="hf-icon-button !size-9 !shadow-none"><ArrowRightIcon className="size-3.5" /></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative border-t border-black/[.06] bg-white/76"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.78), rgba(255,255,255,.9)), url("${HOME_TRUST_BG}"), url("${PAPER_TEXTURE}")`,
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: 'cover, cover, 192px 192px',
        }}
      >
        <div className="hf-container relative grid divide-y divide-black/[.06] md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="flex items-center gap-4 py-5 md:px-7 first:md:pl-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--hf-brand-soft)] text-[var(--hf-brand)]">
              <TruckIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--hf-ink)]">Free UK delivery</p>
              <p className="mt-1 text-xs leading-5 text-black/43">Included as standard.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-5 md:px-7">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--hf-brand-soft)] text-[var(--hf-brand)]">
              <ArchiveBoxIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--hf-ink)]">Free 14-day returns</p>
              <p className="mt-1 text-xs leading-5 text-black/43">On eligible online orders.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-5 md:px-7 last:md:pr-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--hf-brand-soft)] text-[var(--hf-brand)]">
              <ShieldCheckIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--hf-ink)]">Secure checkout</p>
              <p className="mt-1 text-xs leading-5 text-black/43">Protected card payment.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
