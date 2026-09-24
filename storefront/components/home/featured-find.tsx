import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, displayProductTagline, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import styles from './featured-find.module.css'

export function FeaturedFind({ product }: { product?: WooProduct }) {
  if (!product) return null
  const image = product.images?.[0]
  const name = displayProductName(product.name)
  const copy = displayProductTagline(product)
  const href = `/product/${storefrontProductSlug(product)}`

  return (
    <section id="featured-find" className={styles.section} aria-labelledby="featured-find-title">
      <div className={styles.panel}>
        <div className={styles.visual}>
          {image ? (
            <Image src={image.src} alt={image.alt || name} fill sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1544px) 52vw, 770px" className={styles.photo} />
          ) : <div className="absolute inset-0 bg-[#26352c]" />}
          <p className={styles.caption}>Selected by Housefinds</p>
        </div>
        <div className={styles.copy}>
          <p className={`hf-eyebrow ${styles.eyebrow}`}>Featured find</p>
          <h2 id="featured-find-title" className={`hf-editorial-title ${styles.title}`}>
            One useful find. <span>A better little routine.</span>
          </h2>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.tagline}>{copy}</p>
          <ul className={styles.benefits}>
            {['Useful by design', 'Easy to understand', 'Made for everyday life'].map((item) => (
              <li key={item}>
                <span className={styles.check} aria-hidden="true"><CheckIcon /></span>{item}
              </li>
            ))}
          </ul>
          <div className={styles.purchase}>
            <Link href={href} className={`hf-button-secondary ${styles.action}`}>
              Explore this find <ArrowRightIcon aria-hidden="true" />
            </Link>
            <span className={styles.price}>{formatProductPrice(product)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
