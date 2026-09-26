import { ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import type { ProductContent } from '@/lib/storefront/product-content'

export function ProductOptionGuide({ guide, sizes = [] }: {
  guide: ProductContent['guide']
  sizes?: { width: number; length: number; label: string }[]
}) {
  return (
    <details className="group mb-4 border-y border-[var(--hf-brand)]/20">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-[var(--hf-radius-md)] px-4 py-3 text-sm font-semibold text-[var(--hf-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hf-brand)]">
        <AdjustmentsHorizontalIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1">{guide.title}</span>
        <ChevronDownIcon className="size-4 shrink-0 transition-transform motion-reduce:transition-none group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-[var(--hf-brand)]/10 px-4 pb-5 pt-4">
        {sizes.length > 0 && <div className="mb-4">
          <p className="text-xs font-semibold text-[var(--hf-ink)]">Listed size options</p>
          <div className="mt-2 flex flex-wrap gap-2">{sizes.map((size) => <span key={size.label} className="rounded-[var(--hf-radius-sm)] border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[var(--hf-ink)]">{size.label}</span>)}</div>
          <p className="mt-2 text-xs leading-5 text-black/65">Dimensions are length × width. Choose your size using the purchase options below.</p>
        </div>}
        <dl className="space-y-3">
          {guide.points.map((point) => <div key={point.label}>
            <dt className="text-sm font-semibold text-[var(--hf-ink)]">{point.label}</dt>
            <dd className="mt-1 text-sm leading-6 text-black/65">{point.value}</dd>
          </div>)}
        </dl>
        <a href="mailto:contact@housefindsstore.com" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--hf-brand)] underline underline-offset-4">Ask about this product</a>
      </div>
    </details>
  )
}
