import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'

export type HeroFind = { id: number; name: string; href: string; image: string; price: string; label: string }

/** Exact products stay separate from the illustrative scene above. */
export function HeroShowcase({ finds }: { finds: HeroFind[] }) {
  if (!finds.length) return null

  return (
    <div className="hf-hero-finds">
      <div className="hf-container hf-hero-finds-layout">
        <p className="hf-hero-finds-heading">Small finds.<br /><span>Everyday difference.</span></p>
        <ul className="hf-hero-find-list" aria-label="Explore featured finds">
          {finds.map((find) => (
            <li key={find.id}>
              <Link href={find.href} className="hf-hero-find" aria-label={`${find.name}, ${find.price}`}>
                <span className="hf-hero-find-image"><Image src={find.image} alt="" fill sizes="80px" className="object-contain" /></span>
                <span className="hf-hero-find-copy"><span className="hf-hero-find-label">{find.label}</span><span className="hf-hero-product-name">{find.name}</span><span className="hf-hero-find-price">{find.price}</span></span>
                <ArrowUpRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
