import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { STORE_CATEGORIES, filterProductsByStoreCategory } from '@/lib/storefront/categories'
import { merchandisingImages } from '@/lib/storefront/merchandising-images'
import styles from './merchandising.module.css'

export function CategoryGrid({ products }: { products: WooProduct[] }) {
  const categories = STORE_CATEGORIES.flatMap(category => {
    const matches = filterProductsByStoreCategory(products, category.slug)
    const preferred = matches.find(product => category.slug === 'space-saving' ? /shoe storage|shoe rack/i.test(product.name) : category.slug === 'daily-helpers' ? /shoe washing/i.test(product.name) : category.slug === 'kitchen-tools' ? /cutting board|chopping board/i.test(product.name) : false) || matches[0]
    return preferred ? [{ ...category, image: merchandisingImages(preferred)[0] }] : []
  })
  if (!categories.length) return null
  return <nav className={`hf-container ${styles.categories}`} aria-label="Shop by category">
    <div className={styles.sectionHeading}><h2>Find your everyday upgrade.</h2><span>Shop by category</span></div>
    <div className={styles.categoryGrid}>
      {categories.map(category => <Link href={`/shop?category=${category.slug}`} key={category.slug} className={styles.category}>
        <span className={styles.categoryImage}>{category.image && <Image src={category.image.src} alt="" fill sizes="(max-width: 767px) 43vw, 24vw" />}</span>
        <span className={styles.categoryName}>{category.title}<ArrowRightIcon aria-hidden="true" /></span>
      </Link>)}
    </div>
  </nav>
}
