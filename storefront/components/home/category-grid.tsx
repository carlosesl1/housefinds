import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { STORE_CATEGORIES, filterProductsByStoreCategory } from '@/lib/storefront/categories'
import styles from './merchandising.module.css'

export function CategoryGrid({ products }: { products: WooProduct[] }) {
  const categories = STORE_CATEGORIES.flatMap(category => {
    const count = filterProductsByStoreCategory(products, category.slug).length
    return count ? [{ ...category, count }] : []
  })
  if (!categories.length) return null
  return <nav className={`hf-container ${styles.categories}`} aria-label="Shop by category">
    <div className={styles.sectionHeading}><h2>Find your <span className="hf-accent">everyday upgrade.</span></h2><span>Shop by category</span></div>
    <div className={styles.categoryList}>
      {categories.map(category => <Link prefetch={false} href={`/shop?category=${category.slug}`} key={category.slug} className={styles.category}>
        <span className={styles.categoryName}>{category.title}<ArrowRightIcon aria-hidden="true" /></span>
        <span className={styles.categoryCopy}>{category.copy}</span>
        <span className={styles.categoryCount}>{category.count} {category.count === 1 ? 'find' : 'finds'}</span>
      </Link>)}
    </div>
  </nav>
}
