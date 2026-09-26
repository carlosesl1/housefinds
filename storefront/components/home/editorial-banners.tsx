import { getImageProps } from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { getHomePromotions, type HomePromotion } from '@/lib/storefront/home-promotions'
import styles from './editorial-banners.module.css'

// Campaign art remains illustrative. Exact-product media stays on cards/PDPs.
const CAMPAIGN_ART: Record<HomePromotion['id'], string> = {
  kitchen: 'kitchen', storage: 'storage', 'under-20': 'budget',
}

function CampaignScene({ id, wide }: { id: HomePromotion['id']; wide: boolean }) {
  const name = CAMPAIGN_ART[id]
  const { props: desktop } = getImageProps({
    src: `/home/banners/${name}-scene.webp`, alt: '', width: 960, height: 720,
    loading: 'lazy', className: styles.scene,
    sizes: wide ? '(max-width: 767px) 100vw, 55vw' : '(max-width: 767px) 100vw, 50vw',
  })
  const { props: mobile } = getImageProps({
    src: `/home/banners/mobile/${name}-scene.webp`, alt: '', width: 720, height: 600,
    loading: 'lazy', sizes: 'calc(100vw - 32px)',
  })
  return (
    <picture className={styles.picture}>
      <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
      <img {...desktop} decoding="async" />
    </picture>
  )
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
      <div className={`${styles.group} ${wide ? styles.curated : styles.discovery}`}
        role="group" aria-label={wide ? 'Shop by budget' : 'Ideas for everyday home life'}
        data-promotion-group={placement}>
        {banners.map((banner) => (
          <Link key={banner.id} href={banner.href}
            className={`${styles.banner} ${wide ? styles.wide : styles.spotlight}`}
            data-promotion={banner.id}
            aria-labelledby={`campaign-${banner.id}-title campaign-${banner.id}-action`}>
            <div className={styles.art} aria-hidden="true" data-campaign-layer="image">
              <CampaignScene id={banner.id} wide={wide} />
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
            </div>
          </Link>
        ))}
      </div>
      <p className={styles.artNote}>Illustrative room scenes. Explore each collection for available products.</p>
    </div>
  )
}
