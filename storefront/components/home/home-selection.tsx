import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { STORE_CATEGORIES, filterProductsByStoreCategory } from '@/lib/storefront/categories'
import { ProductCard } from '@/components/product/product-card'
import { CollectionTabs } from './collection-tabs'
import styles from './merchandising.module.css'

export function HomeSelection({ products }: { products: WooProduct[] }) {
  if (!products.length) return null
  const tabs = [
    { id: 'all', label: 'All finds', products: products.slice(0, 4), href: '/shop' },
    ...STORE_CATEGORIES.map(category => ({ id: category.slug, label: category.title, products: filterProductsByStoreCategory(products, category.slug).slice(0, 4), href: `/shop?category=${category.slug}` })).filter(tab => tab.products.length),
  ].map(tab => ({ ...tab, content: <div>
    <div className={styles.productGrid}>{tab.products.map(product => <ProductCard key={product.id} product={product} />)}</div>
    {tab.id !== 'all' && <Link href={tab.href} className={styles.categoryMore}>Explore all {tab.label.toLowerCase()} <ArrowRightIcon aria-hidden="true" /></Link>}
  </div> }))
  return <section id="everyday-finds" className={`hf-container ${styles.selection}`} aria-labelledby="selection-title">
    <div className={styles.sectionHeading}><h2 id="selection-title">Useful things, without the clutter.</h2><Link href="/shop" className="hf-text-link">Shop all finds <ArrowRightIcon className="size-4" aria-hidden="true" /></Link></div>
    <CollectionTabs tabs={tabs} className={styles.tabs} />
  </section>
}
