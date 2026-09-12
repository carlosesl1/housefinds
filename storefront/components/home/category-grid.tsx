import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName, findProductByKeywords } from '@/lib/woocommerce/presentation'

const categoryConfig = [
  {
    title: 'Smart Entry',
    copy: 'Smarter door and entry solutions for a quieter, easier home.',
    keywords: ['door closer', 'door stop'],
    tone: 'bg-[#e7eee9]',
  },
  {
    title: 'Kitchen Tools',
    copy: 'Clever prep tools that save time, space and unnecessary effort.',
    keywords: ['oil spray', 'cutting board', 'spoon scale'],
    tone: 'bg-[#efe7db]',
  },
  {
    title: 'Space Saving',
    copy: 'Useful organization ideas for making more from the space you have.',
    keywords: ['shoe storage', 'shoe rack', 'toothbrush holder'],
    tone: 'bg-[#e8e9e2]',
  },
  {
    title: 'Daily Helpers',
    copy: 'Those little products you did not know you needed until you use them.',
    keywords: ['motion sensor led', 'mosquito', 'bath mat', 'shoe washing'],
    tone: 'bg-[#e5ebe7]',
  },
]

export function CategoryGrid({ products }: { products: WooProduct[] }) {
  return (
    <section className="bg-[#fbfaf7] px-6 py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">
              Shop by category <span className="h-px w-16 bg-black/15" />
            </div>
            <h2 className="mt-5 text-[clamp(3.5rem,5.7vw,6.7rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#0e1420]">
              Find the fix.<br />
              <span className="text-[#557562]">Keep the good part.</span>
            </h2>
          </div>
          <p className="max-w-md pb-2 text-lg leading-8 text-black/48">
            Shop useful products by the kind of everyday problem they help solve.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categoryConfig.map((category, index) => {
            const product = findProductByKeywords(products, category.keywords) || products[index % Math.max(products.length, 1)]
            const image = product?.images?.[0]
            const productName = product ? displayProductName(product.name) : ''

            return (
              <Link
                href={product ? `/produto/${product.slug}` : '/shop'}
                key={category.title}
                className={`group overflow-hidden rounded-[34px] ${category.tone} transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(30,45,35,.10)]`}
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-black/[.035]">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || productName}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.045]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(255,255,255,.75),transparent_32%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/5" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/84 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] backdrop-blur">
                    0{index + 1}
                  </span>
                  <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/50 bg-white/84 backdrop-blur transition group-hover:bg-white">
                    <ArrowUpRightIcon className="size-4" />
                  </span>
                </div>

                <div className="p-6 lg:p-7">
                  <h3 className="text-3xl font-semibold tracking-[-.045em] text-[#111720]">{category.title}</h3>
                  <p className="mt-3 min-h-12 text-[15px] leading-6 text-black/52">{category.copy}</p>
                  {product && (
                    <p className="mt-5 line-clamp-1 text-xs font-medium uppercase tracking-[.12em] text-black/38">Featuring {productName}</p>
                  )}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#294c3b]">
                    Explore <ArrowUpRightIcon className="size-3.5" />
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
