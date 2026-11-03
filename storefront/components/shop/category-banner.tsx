import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import type { StoreCategory } from '@/lib/storefront/categories'
import { merchandisingImages } from '@/lib/storefront/merchandising-images'
import { displayProductName } from '@/lib/woocommerce/presentation'
import styles from './category-banner.module.css'

const edits: Record<string, { lead: string; emphasis: string; description: string; image?: string; alt?: string; treatment: string }> = {
  all: {
    lead: 'Good finds.', emphasis: 'Better living.',
    description: 'Thoughtful little solutions for your kitchen, your space and the things you do every day.',
    image: '/home/banners/kitchen-hero-v2.webp',
    alt: 'Illustrative kitchen still life with a steel board, cooking oil bottle, measuring spoon and fresh ingredients',
    treatment: 'kitchen',
  },
  'kitchen-tools': {
    lead: 'A little less effort.', emphasis: 'A lot more kitchen.',
    description: 'Useful tools for the prep, the cooking and the everyday in between.',
    image: '/home/banners/kitchen-hero-v2.webp',
    alt: 'Illustrative kitchen still life with a steel board, cooking oil bottle, measuring spoon and fresh ingredients',
    treatment: 'kitchen',
  },
  'space-saving': {
    lead: 'Less clutter.', emphasis: 'More room for you.',
    description: 'Small organising ideas that make more of the home you already have.',
    image: '/home/banners/storage-banner-v2.webp',
    alt: 'Illustrative organisation scene with neatly stored bathroom and household essentials',
    treatment: 'storage',
  },
  'daily-helpers': {
    lead: 'Little helpers.', emphasis: 'Everyday difference.',
    description: 'Discover the useful little things that fit into your daily routine.',
    image: '/home/banners/budget-scene.webp',
    alt: 'Illustrative home scene with a small light and practical kitchen accessories',
    treatment: 'everyday',
  },
  'smart-entry': {
    lead: 'Welcome home.', emphasis: 'Make it easier.',
    description: 'Thoughtful door and entry solutions for the way you come and go.',
    treatment: 'entry',
  },
}

export function CategoryBanner({ category, products, unavailable = false }: { category?: StoreCategory; products: WooProduct[]; unavailable?: boolean }) {
  const edit = edits[category?.slug || 'all'] || edits.all
  const product = edit.treatment === 'entry'
    ? products.find(item => /door closer|door stop|door stopper/i.test(item.name) && merchandisingImages(item).length > 0)
    : undefined
  const productImage = product && merchandisingImages(product)[0]
  const image = productImage?.src || edit.image
  const alt = product ? displayProductName(product.name) : edit.alt || ''

  return <section className={`${styles.banner} ${styles[edit.treatment]} ${!image ? styles.withoutImage : ''}`} aria-labelledby="shop-title">
    <div className={styles.stage}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{category?.title || 'The Housefinds collection'}</p>
        <h1 id="shop-title"><span>{edit.lead}</span>{' '}<em>{edit.emphasis}</em></h1>
        <p className={styles.description}>{edit.description}</p>
        {!unavailable && <a href="#shop-results" className={styles.cta}>Explore {category ? category.title.toLowerCase() : 'the collection'}<ArrowRightIcon aria-hidden="true" /></a>}
      </div>
      {image && <div className={styles.visual}>
        <Image src={image} alt={alt} fill preload sizes="(max-width: 700px) 100vw, (max-width: 1500px) 72vw, 1000px" className={styles.image} />
      </div>}
    </div>
  </section>
}
