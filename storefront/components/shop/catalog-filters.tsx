'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import styles from './shop.module.css'

export function CatalogFilters({ count, children }: { count: number; children: ReactNode }) {
  const panel = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 801px)')
    const sync = () => { if (panel.current) panel.current.open = desktop.matches }
    sync()
    desktop.addEventListener('change', sync)
    return () => desktop.removeEventListener('change', sync)
  }, [])

  return <details ref={panel} className={styles.filterPanel} open>
    <summary><span><AdjustmentsHorizontalIcon aria-hidden="true" /> Filters {count > 0 && <b>{count}</b>}</span><ChevronDownIcon aria-hidden="true" /></summary>
    <div className={styles.filterBody}>{children}</div>
  </details>
}
