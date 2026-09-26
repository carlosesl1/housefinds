import Link from 'next/link'
import { TruckIcon, ArrowPathIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import styles from './merchandising.module.css'

export function StoreBenefits() {
  return <nav className={`hf-container ${styles.benefits}`} aria-label="Shopping information">
    <Link href="/shipping"><TruckIcon aria-hidden="true" /><span><strong>Free UK delivery</strong><small>Estimated around 14 days</small></span></Link>
    <Link href="/returns"><ArrowPathIcon aria-hidden="true" /><span><strong>Free 14-day returns</strong><small>On eligible orders</small></span></Link>
    <Link href="/faq"><CreditCardIcon aria-hidden="true" /><span><strong>Secure card checkout</strong><small>A simple way to pay</small></span></Link>
  </nav>
}
