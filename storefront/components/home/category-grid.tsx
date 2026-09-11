import Link from 'next/link'
import {
  HomeModernIcon,
  Squares2X2Icon,
  ArchiveBoxIcon,
  SparklesIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline'

const categories = [
  {
    title: 'Smart Entry',
    copy: 'Small upgrades for doors, entryways and everyday peace of mind.',
    icon: HomeModernIcon,
    tone: 'from-[#dce7df] to-[#eef2ed]',
    accent: '#3f6652',
  },
  {
    title: 'Kitchen Tools',
    copy: 'Clever prep tools that save time, space and unnecessary effort.',
    icon: Squares2X2Icon,
    tone: 'from-[#eee3d4] to-[#f6f1e8]',
    accent: '#8b6643',
  },
  {
    title: 'Space Saving',
    copy: 'Useful organization ideas for making more from the space you have.',
    icon: ArchiveBoxIcon,
    tone: 'from-[#dde1d9] to-[#f1f1ec]',
    accent: '#68725d',
  },
  {
    title: 'Daily Helpers',
    copy: 'Those little products you did not know you needed until you use them.',
    icon: SparklesIcon,
    tone: 'from-[#e2e7e4] to-[#f3f5f3]',
    accent: '#507561',
  },
]

export function CategoryGrid() {
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
            Housefinds is built around practical products that solve a small problem without making your home feel complicated.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link
                href="/shop"
                key={category.title}
                className={`group relative min-h-[410px] overflow-hidden rounded-[34px] bg-gradient-to-br ${category.tone} p-7 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(30,45,35,.10)]`}
              >
                <div className="absolute -right-16 -top-16 size-56 rounded-full border border-white/60 bg-white/25 transition duration-700 group-hover:scale-110" />
                <div className="absolute bottom-20 right-5 text-[8rem] font-semibold leading-none tracking-[-.08em] text-white/55 select-none">
                  0{index + 1}
                </div>

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/70 shadow-sm backdrop-blur">
                      <Icon className="size-7" style={{ color: category.accent }} />
                    </span>
                    <span className="grid size-11 place-items-center rounded-full border border-black/10 bg-white/50 transition group-hover:bg-white">
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-.045em] text-[#111720]">{category.title}</h3>
                    <p className="mt-3 max-w-[280px] text-[15px] leading-6 text-black/52">{category.copy}</p>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#294c3b]">
                      Explore category <ArrowUpRightIcon className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
