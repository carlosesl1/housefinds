import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { getHomePromotions } from '@/lib/storefront/home-promotions'
import { merchandisingImages } from '@/lib/storefront/merchandising-images'
import { FeaturedFind } from './featured-find'
import styles from './merchandising.module.css'

export function HomeCampaigns({ products, featuredProduct }: { products: WooProduct[]; featuredProduct?: WooProduct }) {
  const kitchen = getHomePromotions(products, 'discovery').find(promotion => promotion.id === 'kitchen')
  const board = kitchen && products.find(product => /cutting board|chopping board/i.test(product.name) && product.is_in_stock && product.is_purchasable)
  const image = board ? merchandisingImages(board)[0] : undefined
  if (!kitchen && !featuredProduct) return null
  return <div className={`hf-container ${styles.campaigns}`}>
    {kitchen && <Link href={kitchen.href} className={styles.kitchen}>
      <span className={styles.kitchenArt}><Image src={image?.src || '/home/banners/kitchen-scene.webp'} alt={image ? 'The stainless steel cutting board in use for everyday food prep' : 'Illustrative kitchen scene'} fill sizes="(max-width: 767px) 90vw, 54vw" /></span>
      <div className={styles.kitchenCopy}><h2>Kitchen tools that earn their space.</h2><span>Explore kitchen <ArrowRightIcon aria-hidden="true" /></span></div>
    </Link>}
    <FeaturedFind product={featuredProduct} compact />
  </div>
}

export function HomeClosingBanner({ products }: { products: WooProduct[] }) {
  const storage = getHomePromotions(products, 'discovery').find(promotion => promotion.id === 'storage')
  if (!storage) return null
  return <section className={`hf-container ${styles.closing}`} aria-labelledby="storage-banner-title">
    <div className={styles.closingCopy}>
      <p>A little room to breathe.</p>
      <h2 id="storage-banner-title">Small spaces.<br />Better organised.</h2>
      <Link href={storage.href}>Explore space saving <ArrowRightIcon aria-hidden="true" /></Link>
    </div>
    <div className={styles.closingArt}><Image src="/home/banners/storage-banner-v2.webp" alt="" fill sizes="(max-width: 900px) 90vw, 48vw" /><small>Illustrative room scene</small></div>
  </section>
}
