import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { isUnderTwentyProduct } from '@/lib/storefront/home-promotions'
import { ProductCard } from '@/components/product/product-card'
import styles from './budget-shelf.module.css'

export function BudgetShelf({ products }: { products: WooProduct[] }) {
  const picks = products.filter(isUnderTwentyProduct).slice(0, 3)
  if (!picks.length) return null
  return <section className={styles.shelf} aria-labelledby="budget-title">
    <div className={`hf-container ${styles.layout}`}>
      <div className={styles.heading}>
        <p>A little goes a long way</p>
        <h2 id="budget-title">Useful finds.<br /><span>Under £20.</span></h2>
        <p className={styles.description}>Little upgrades for everyday home life. Every option in this edit is below £20.</p>
        <Link href="/collections/under-20" className="hf-text-link">Explore the edit <ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
      </div>
      <div className={styles.products} aria-label="A selection under £20">{picks.map(product => <ProductCard key={product.id} product={product} />)}</div>
    </div>
  </section>
}
