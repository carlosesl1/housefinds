import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatProductPrice } from '@/lib/woocommerce/money'
import { displayProductName, getProductStory, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { merchandisingImages } from '@/lib/storefront/merchandising-images'
import styles from './featured-find.module.css'

export function FeaturedFind({ product, compact = false }: { product?: WooProduct; compact?: boolean }) {
  if (!product) return null
  const image = (compact && product.id === 333 ? product.images.find(photo => photo.id === 315) : undefined) || merchandisingImages(product)[0]
  const name = displayProductName(product.name)
  const story = getProductStory(product)
  const detail = product.images?.[1]
  const href = `/product/${storefrontProductSlug(product)}`

  return (
    <section id="featured-find" className={`${styles.section} ${compact ? styles.compact : ''}`} aria-labelledby="featured-find-title">
      <div className={`${compact ? '' : 'hf-container'} ${styles.panel}`}>
        <div className={styles.visual}>
          {image ? (
            <Image src={image.src} alt={image.alt || name} fill sizes="(max-width: 767px) 90vw, 48vw" className={styles.photo} />
          ) : <div className="absolute inset-0 bg-[#26352c]" />}
          {detail && !compact && <Link href={href} className={styles.detail} aria-label={`See the details of ${name}`}><Image src={detail.src} alt={`Another view of ${name}`} fill sizes="(max-width: 767px) 34vw, 200px" className={styles.detailPhoto} /><span>A closer look <ArrowRightIcon aria-hidden="true" /></span></Link>}
        </div>
        <div className={styles.copy}>
          <p className={`hf-eyebrow ${styles.eyebrow}`}>One useful idea</p>
          <h2 id="featured-find-title" className={styles.title}>{name}</h2>
          <p className={styles.note}>{story.headline}</p>
          {!compact && <p className={styles.tagline}>{story.intro}</p>}
          {!compact && <ul className={styles.benefits}>{story.benefits.map(benefit => <li key={benefit}>{benefit}</li>)}</ul>}
          <div className={styles.purchase}>
            <Link href={href} className={`hf-button-primary ${styles.action}`}>
              Discover the details <ArrowRightIcon aria-hidden="true" />
            </Link>
            <span className={styles.price}>{formatProductPrice(product)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
