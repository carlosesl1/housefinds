import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, TagIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { getHomePromotions } from '@/lib/storefront/home-promotions'
import styles from './editorial-banners.module.css'

/** Section footers, not another stack of full-width campaign sections. */
export function EditorialBanners({ products, placement = 'discovery' }: {
  products: WooProduct[]
  placement?: 'discovery' | 'curated'
}) {
  const banners = getHomePromotions(products, placement)
  if (!banners.length) return null
  const compact = placement === 'curated'

  return (
    <div
      className={`${styles.group} ${compact ? styles.curated : styles.discovery}`}
      role="group"
      aria-label={compact ? 'Shop by budget' : 'More ways to make home life easier'}
      data-promotion-group={placement}
    >
      {banners.map((banner) => {
        const image = banner.products[0]?.images.find((item) => item.src)
        return (
          <Link
            key={banner.id}
            href={banner.href}
            className={`${styles.banner} ${compact ? styles.compact : styles.spotlight}`}
            data-promotion={banner.id}
          >
            {compact && <span className={styles.icon} aria-hidden="true"><TagIcon /></span>}
            <div className={styles.copy}>
              <p className={`hf-eyebrow ${styles.eyebrow}`}>{banner.eyebrow}</p>
              <h3 className={styles.title}>{banner.title} <span>{banner.emphasis}</span></h3>
              <p className={styles.description}>{banner.description}</p>
              {!compact && (
                <span className={`hf-button-tertiary ${styles.action}`}>
                  {banner.action}<ArrowRightIcon aria-hidden="true" />
                </span>
              )}
            </div>
            {compact ? (
              <span className={`hf-button-primary ${styles.action}`}>
                {banner.action}<ArrowRightIcon aria-hidden="true" />
              </span>
            ) : image ? (
              <div className={styles.visual} aria-hidden="true">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(max-width: 767px) 40vw, (max-width: 1023px) 44vw, 320px"
                  className={styles.productImage}
                />
              </div>
            ) : null}
          </Link>
        )
      })}
    </div>
  )
}
