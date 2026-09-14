import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName, findProductByKeywords, storefrontProductSlug } from '@/lib/woocommerce/presentation'

const picks = [
  {
    eyebrow: 'Less clutter, more room',
    problem: 'Shoes and everyday things take over more space than they should.',
    solution: 'A compact storage upgrade keeps more within reach without making the room feel busy.',
    keywords: ['shoe storage', 'shoe rack', 'toothbrush holder'],
  },
  {
    eyebrow: 'Let the door handle itself',
    problem: 'Doors slam, drift open or get left behind during the day.',
    solution: 'A simple automatic closer adds a little control without a complicated installation.',
    keywords: ['door closer', 'door stop'],
  },
  {
    eyebrow: 'Prep with less friction',
    problem: 'Small cooking tasks create more mess and measuring than they need to.',
    solution: 'Useful prep tools make measuring, spraying and cutting feel simpler.',
    keywords: ['spoon scale', 'oil spray', 'cutting board'],
  },
]

export function ProblemSolvingPicks({ products }: { products: WooProduct[] }) {
  const resolved = picks.flatMap((pick, index) => {
    const product = findProductByKeywords(products, pick.keywords) || products[index]
    return product ? [{ ...pick, product }] : []
  })

  if (!resolved.length) return null

  return (
    <section className="bg-[#f4f2ec] px-6 py-28 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center">
          <div className="mx-auto flex w-fit items-center gap-4 text-[11px] font-semibold uppercase tracking-[.3em] text-black/42">
            <span className="h-px w-14 bg-black/15" /> Real problems · Smart solutions <span className="h-px w-14 bg-black/15" />
          </div>
          <h2 className="mt-5 text-[clamp(3.6rem,5.7vw,6.7rem)] font-semibold leading-[.9] tracking-[-.065em]">
            Problem-solving <span className="text-[#557562]">picks.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-black/48">Useful products make the most sense when you can immediately see the little problem they remove.</p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {resolved.map(({ product, eyebrow, problem, solution }) => {
            const image = product.images?.[0]
            const name = displayProductName(product.name)
            const href = `/product/${storefrontProductSlug(product)}`

            return (
              <Link key={`${eyebrow}-${product.id}`} href={href} className="group overflow-hidden rounded-[34px] bg-white shadow-[0_14px_55px_rgba(33,45,37,.05)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e7e1]">
                  {image && (
                    <Image src={image.src} alt={image.alt || name} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex gap-3 p-4">
                    <div className="max-w-[48%] rounded-2xl bg-white/88 p-3 text-xs leading-5 shadow-sm backdrop-blur">
                      <strong className="block text-black/70">The problem</strong>
                      <span className="text-black/48">{problem}</span>
                    </div>
                    <div className="ml-auto max-w-[48%] rounded-2xl bg-[#e5eee7]/92 p-3 text-xs leading-5 shadow-sm backdrop-blur">
                      <strong className="block text-[#345944]">The fix</strong>
                      <span className="text-black/52">{solution}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 lg:p-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#557562]">{eyebrow}</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-.045em]">{name}</h3>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#355f4a]">Discover the solution <ArrowRightIcon className="size-4" /></span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
