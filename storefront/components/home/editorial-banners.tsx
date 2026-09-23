import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName } from '@/lib/woocommerce/presentation'
import { getHomePromotions } from '@/lib/storefront/home-promotions'
import styles from './editorial-banners.module.css'

export function EditorialBanners({ products, placement = 'discovery' }: {
  products: WooProduct[]
  placement?: 'discovery' | 'curated'
}) {
  const banners = getHomePromotions(products, placement)
  if (!banners.length) return null
  return (
    <section className={styles.section} aria-label={placement === 'discovery' ? 'Explore our collections' : 'More Housefinds collections'}>
      <div className={`hf-container ${styles.grid}`}>
        {banners.map((banner) => (
          <Link key={banner.id} href={banner.href} className={`${styles.banner} ${styles[banner.id]}`} data-promotion={banner.id}>
            <Image src="/home/banners/editorial-botanical.webp" alt="" fill sizes="(max-width: 1023px) 100vw, 50vw" className={styles.background} />
            <span className={styles.arc} aria-hidden="true" />
            <div className={styles.copy}>
              <p className={styles.eyebrow}>{banner.eyebrow}</p>
              <h2 className={styles.title}>{banner.title}</h2>
              <p className={styles.description}>{banner.description}</p>
              <span className={`hf-button-primary ${styles.action}`}>{banner.action}<ArrowRightIcon className="size-4" aria-hidden="true" /></span>
            </div>
            <div className={styles.visual} aria-hidden="true">
              <span className={styles.ground} />
              {banner.products.map((product, index) => {
                const image = product.images.find((item) => item.src)!
                return (
                  <span key={product.id} className={index === 0 ? styles.mainImage : styles.secondaryImage}>
                    <Image src={image.src} alt="" fill sizes={index === 0 ? '(max-width: 639px) 140px, (max-width: 1023px) 260px, 230px' : '(max-width: 639px) 90px, 140px'} className={styles.productImage} />
                  </span>
                )
              })}
              <span className={styles.caption}>From the Housefinds collection</span>
            </div>
            <span className="sr-only">Featuring {banner.products.map((product) => displayProductName(product.name)).join(' and ')}.</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
