import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon, HomeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { getHomePromotions, type HomePromotion } from '@/lib/storefront/home-promotions'
import styles from './editorial-banners.module.css'

// Approved lifestyle scenes, cropped to remove campaign text and UI. They are
// collection inspiration, never a replacement for exact-product gallery media.
const CAMPAIGN_ART: Record<HomePromotion['id'], string> = {
  kitchen: '/home/banners/kitchen-scene.webp',
  storage: '/home/banners/storage-scene.webp',
  'under-20': '/home/banners/budget-scene.webp',
}

export function EditorialBanners({ products, placement = 'discovery' }: {
  products: WooProduct[]
  placement?: 'discovery' | 'curated'
}) {
  const banners = getHomePromotions(products, placement)
  if (!banners.length) return null
  const wide = placement === 'curated'

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.group} ${wide ? styles.curated : styles.discovery}`}
        role="group"
        aria-label={wide ? 'Shop by budget' : 'Ideas for everyday home life'}
        data-promotion-group={placement}
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            className={`${styles.banner} ${wide ? styles.wide : styles.spotlight}`}
            data-promotion={banner.id}
            aria-labelledby={`campaign-${banner.id}-title campaign-${banner.id}-action`}
          >
            <div className={styles.art} aria-hidden="true" data-campaign-layer="image">
              <Image
                src={CAMPAIGN_ART[banner.id]}
                alt=""
                fill
                loading="lazy"
                sizes={wide
                  ? '(max-width: 767px) calc(100vw - 32px), (max-width: 1536px) 65vw, 960px'
                  : '(max-width: 767px) calc(100vw - 32px), (max-width: 1099px) 65vw, 480px'}
                className={styles.scene}
              />
            </div>
            <div className={styles.copy} data-campaign-layer="content">
              <p className={styles.eyebrow}>{banner.eyebrow}</p>
              <h3 id={`campaign-${banner.id}-title`} className={styles.title}>
                {banner.title} <span>{banner.emphasis}</span>
              </h3>
              <p className={styles.description}>{banner.description}</p>
              <span id={`campaign-${banner.id}-action`} className={`hf-button-primary ${styles.action}`}>
                {banner.action}<ArrowRightIcon aria-hidden="true" />
              </span>
              {!wide && (
                <div className={styles.benefits}>
                  <span><HomeIcon aria-hidden="true" />A more organised home</span>
                  <span><SparklesIcon aria-hidden="true" />Everyday essentials</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      <p className={styles.artNote}>Illustrative room scenes. Explore each collection for available products.</p>
    </div>
  )
}
