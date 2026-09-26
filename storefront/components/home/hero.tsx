import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName, findProductByKeywords, storefrontProductSlug } from '@/lib/woocommerce/presentation'
import { formatProductPrice } from '@/lib/woocommerce/money'
import styles from './hero.module.css'

export function Hero({ products }: { products: WooProduct[] }) {
  const find = findProductByKeywords(products, ['oil spray'])
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={`hf-container ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.intro}>Small changes. Bigger living.</p>
          <h1 id="home-title">Smart finds for<br /><span>a better home.</span></h1>
          <p className={styles.description}>Clever, useful products to make everyday life simpler, tidier and a little smarter.</p>
          <div className={styles.actions}>
            <Link href="/shop" className="hf-button-primary">Shop all products <ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
            <Link href="#everyday-finds" className="hf-text-link">Explore finds <ArrowRightIcon className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.visual}>
          <Image src="/home/banners/kitchen-hero-v2.webp" alt="" fill preload sizes="(min-width: 1101px) 100vw, (min-width: 768px) 61vw, 100vw" className={styles.photo} />
          <span className={styles.artNote}>Illustrative kitchen scene</span>
          {find && <Link href={`/product/${storefrontProductSlug(find)}`} className={styles.find}>
            <span><small>Explore a kitchen find</small><strong>{displayProductName(find.name)}</strong></span>
            <span className={styles.findPrice}>{formatProductPrice(find)}<ArrowRightIcon aria-hidden="true" /></span>
          </Link>}
        </div>
      </div>
    </section>
  )
}
