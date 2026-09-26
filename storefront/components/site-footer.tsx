import Image from 'next/image'
import Link from 'next/link'
import styles from './site-footer.module.css'

const groups = [
  { title: 'Shop', links: [['All products', '/shop'], ['New in', '/shop?sort=new'], ['Popular finds', '/shop?sort=popular'], ['Under £20', '/collections/under-20'], ['Search finds', '/search']] },
  { title: 'Categories', links: [['Kitchen tools', '/shop?category=kitchen-tools'], ['Smart entry', '/shop?category=smart-entry'], ['Space saving', '/shop?category=space-saving'], ['Daily helpers', '/shop?category=daily-helpers']] },
  { title: 'Customer care', links: [['Track an order', '/track-order'], ['Shipping & delivery', '/shipping'], ['Returns', '/returns'], ['FAQ', '/faq'], ['Contact', '/contact'], ['About Housefinds', '/about']] },
]

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className="hf-container">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label="Housefinds home"><Image src="/housefinds-logo.svg" alt="Housefinds" width={720} height={210} /></Link>
          <p>Small changes. Bigger living.</p>
          <p className={styles.description}>A UK-focused edit of useful home products, chosen for everyday life.</p>
          <a href="mailto:contact@housefindsstore.com">contact@housefindsstore.com</a>
        </div>
        {groups.map(group => <nav key={group.title} aria-label={`Footer ${group.title.toLowerCase()}`}><h2>{group.title}</h2><ul>{group.links.map(([label,href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></nav>)}
      </div>
      <div className={styles.service}><p>Free standard UK delivery · Estimated around 14 days</p><p>Free 14-day returns on eligible orders · Secure card checkout</p></div>
      <div className={styles.bottom}><span>© 2026 Housefinds. All rights reserved.</span><div><Link href="/privacy-policy">Privacy</Link><Link href="/terms">Terms</Link></div></div>
    </div>
  </footer>
}
