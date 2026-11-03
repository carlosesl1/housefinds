'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { SHOP_PRICES, shopHref } from '@/lib/storefront/shop'
import styles from './shop.module.css'

const goals = [
  { value: 'kitchen-tools', label: 'Make cooking easier' },
  { value: 'space-saving', label: 'Make room for more' },
  { value: 'smart-entry', label: 'Improve my doorway' },
  { value: 'daily-helpers', label: 'Simplify daily routines' },
]

export function FindYourFit({ categories }: { categories: string[] }) {
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  return <details className={styles.finder}>
    <summary>
      <span className={styles.finderIcon} aria-hidden="true">?</span>
      <span><strong>Not sure where to start?</strong><small>Two quick choices. Finds that fit your home.</small></span>
      <span className={styles.finderAction}>Help me choose <ChevronDownIcon aria-hidden="true" /></span>
    </summary>
    <div className={styles.finderBody}>
      <fieldset>
        <legend><span>01</span> What would you like a hand with?</legend>
        <div className={styles.choices}>{goals.filter(goal => categories.includes(goal.value)).map(goal => <label key={goal.value}>
          <input type="radio" name="finder-goal" value={goal.value} checked={category === goal.value} onChange={() => setCategory(goal.value)} />
          <span>{goal.label}</span>
        </label>)}</div>
      </fieldset>
      <fieldset>
        <legend><span>02</span> What is your budget?</legend>
        <div className={styles.choices}>{[{ value: '', label: 'Any budget' }, ...SHOP_PRICES].map(option => <label key={option.value}>
          <input type="radio" name="finder-price" value={option.value} checked={price === option.value} onChange={() => setPrice(option.value)} />
          <span>{option.label}</span>
        </label>)}</div>
      </fieldset>
      <div className={styles.finderFoot}><p>We’ll filter the collection using your choices.</p><Link prefetch={false} className="hf-button-primary hf-button-sm" href={`${shopHref({ category, price })}#shop-results`}>Show my finds <ArrowRightIcon className="size-4" aria-hidden="true" /></Link></div>
    </div>
  </details>
}
