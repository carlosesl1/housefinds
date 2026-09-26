'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

type CollectionTab = { id: string; label: string; count?: number; content: ReactNode }

export function CollectionTabs({ tabs, className = '' }: { tabs: CollectionTab[]; className?: string }) {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  function navigate(event: KeyboardEvent, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1
    if (next < 0) return
    event.preventDefault()
    setActive(next)
    buttons.current[next]?.focus()
  }
  return <div className={`hf-collection-tabs ${className}`}>
    <div className="hf-tabs" role="tablist" aria-label="Browse the Housefinds edit">
      {tabs.map((tab, index) => <button key={tab.id} ref={(node) => { buttons.current[index] = node }} id={`edit-tab-${tab.id}`} type="button" role="tab" aria-label={tab.label} aria-selected={index === active} aria-controls={`edit-panel-${tab.id}`} tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={(event) => navigate(event, index)}><span>{tab.label}</span>{tab.count !== undefined && <span className="hf-tab-count" aria-hidden="true">{tab.count}</span>}</button>)}
    </div>
    {tabs.map((tab, index) => <div key={tab.id} id={`edit-panel-${tab.id}`} role="tabpanel" aria-labelledby={`edit-tab-${tab.id}`} tabIndex={0} hidden={index !== active} className="hf-collection-panel">{tab.content}</div>)}
  </div>
}
