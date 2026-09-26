'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { StorefrontImage } from '@/lib/storefront/client-product'
import { approvedProductVideo, type ProductVideo } from '@/lib/storefront/product-content'

type Media = { key: string; kind: 'image'; image: StorefrontImage; label: string } | { key: 'video'; kind: 'video'; video: ProductVideo; label: string }

export function ProductGallery({ images, productName, video }: { images: StorefrontImage[]; productName: string; video?: ProductVideo }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [variationImage, setVariationImage] = useState<StorefrontImage | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [failedVideo, setFailedVideo] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)

  const media = useMemo<Media[]>(() => {
    const photos = images.filter((image, index, all) => image.src && all.findIndex((candidate) => candidate.src === image.src) === index).slice(0, 12)
    const items: Media[] = photos.map((image, index) => ({ key: image.src, kind: 'image', image, label: `Photo ${index + 1}` }))
    const approved = approvedProductVideo(video)
    if (approved) items.splice(Math.min(1, items.length), 0, { key: 'video', kind: 'video', video: approved, label: 'Video' })
    if (variationImage && !items.some((item) => item.kind === 'image' && item.image.src === variationImage.src)) {
      items.push({ key: variationImage.src, kind: 'image', image: variationImage, label: 'Option photo' })
    }
    return items
  }, [images, video, variationImage])
  const found = media.findIndex((item) => item.key === activeKey)
  const active = found >= 0 ? found : 0
  const current = media[active]

  function select(key: string) { setActiveKey(key); setFailedVideo(false) }
  function move(direction: number) {
    if (media.length < 2) return
    select(media[(active + direction + media.length) % media.length].key)
  }
  function closeViewer() { setExpanded(false) }

  useEffect(() => {
    const onVariation = (event: Event) => {
      const image = (event as CustomEvent<StorefrontImage | null>).detail
      if (!image?.src) { setVariationImage(null); setActiveKey(null); return }
      setVariationImage(image)
      setActiveKey(image.src)
      setFailedVideo(false)
    }
    window.addEventListener('housefinds:variation-image', onVariation)
    return () => window.removeEventListener('housefinds:variation-image', onVariation)
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    const selected = strip?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!strip || !selected) return
    // Scroll the thumbnail strip only, never the document or the purchase panel.
    const left = selected.offsetLeft - strip.offsetLeft - (strip.clientWidth - selected.offsetWidth) / 2
    strip.scrollTo({ left: Math.max(0, left), behavior: 'auto' })
  }, [activeKey, media.length])

  useEffect(() => {
    if (!expanded) return
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      openerRef.current?.focus({ preventScroll: true })
    }
  }, [expanded])

  function onTouchStart(event: React.TouchEvent) {
    suppressClick.current = false
    touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
  }
  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current; touchStart.current = null
    const end = event.changedTouches[0]
    if (!start || !end || media.length < 2) return
    const dx = end.clientX - start.x; const dy = end.clientY - start.y
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy) * 1.4) return
    suppressClick.current = true
    move(dx > 0 ? -1 : 1)
  }

  const arrowClass = 'grid size-11 shrink-0 place-items-center rounded-[var(--hf-radius-sm)] border border-black/15 bg-white text-[var(--hf-ink)] transition hover:bg-[var(--hf-brand-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hf-brand)] motion-reduce:transition-none'

  function player(isExpanded: boolean) {
    if (!current || current.kind !== 'video') return null
    return failedVideo ? (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-sm">
        <p>This video could not be loaded.</p>
        {media.some((item) => item.kind === 'image') && <button type="button" className="hf-button-secondary" onClick={() => select(media.find((item) => item.kind === 'image')!.key)}>View product photos</button>}
      </div>
    ) : (
      <video key={`${current.key}-${isExpanded}`} className="h-full w-full object-contain" controls playsInline preload="none" poster={current.video.poster} onError={() => setFailedVideo(true)} aria-label={current.video.title}>
        <source src={current.video.src} type={current.video.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        {current.video.captions && <track kind="captions" src={current.video.captions} srcLang="en" label="English" default />}
        Your browser cannot play this video. Use the product photos and written demonstration below.
      </video>
    )
  }

  function thumbnails(isExpanded = false) {
    return media.map((item, index) => (
      <button key={item.key} type="button" aria-label={`Show ${productName}: ${item.label}`} aria-current={index === active ? 'true' : undefined} onClick={() => select(item.key)}
        className={`relative w-[64px] shrink-0 snap-start rounded-[var(--hf-radius-sm)] border p-1 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hf-brand)] sm:w-[76px] motion-reduce:transition-none ${index === active ? 'border-[var(--hf-brand)] bg-[var(--hf-brand-soft)]' : isExpanded ? 'border-white/25 bg-white/90 hover:bg-white' : 'border-black/10 bg-white hover:border-[var(--hf-brand)]/50'}`}>
        <span className="relative block aspect-square overflow-hidden rounded-[8px] bg-[#efede7]">
          <Image src={item.kind === 'image' ? item.image.thumbnail || item.image.src : item.video.poster} alt="" fill sizes="76px" className="object-contain" />
          {item.kind === 'video' && <span className="absolute inset-0 grid place-items-center bg-black/15"><PlayIcon className="size-7 rounded-full bg-white p-1.5 text-[var(--hf-brand)]" aria-hidden="true" /></span>}
        </span>
        <span className="mt-1 block truncate text-[10px] font-medium leading-4 text-[var(--hf-ink)]">{item.label}</span>
      </button>
    ))
  }

  if (!current) return <div className="grid aspect-square place-items-center rounded-[var(--hf-radius-lg)] bg-[var(--hf-surface-soft)] p-6 text-center text-sm text-black/65">No product photo is available yet.</div>

  return (
    <>
      <div className="hf-gallery-stage relative aspect-square overflow-hidden bg-[var(--hf-surface-soft)] sm:aspect-[4/3]" style={{ touchAction: 'pan-y pinch-zoom' }} onTouchStart={current.kind === 'image' ? onTouchStart : undefined} onTouchEnd={current.kind === 'image' ? onTouchEnd : undefined} onTouchCancel={() => { touchStart.current = null }}>
        {current.kind === 'image' ? <>
          <Image key={current.key} src={current.image.src} alt={current.image.alt || `${productName} — ${current.label.toLowerCase()}`} fill priority={active === 0} sizes="(max-width:1023px) calc(100vw - 40px), (max-width:1599px) 52vw, 780px" className="object-contain p-2 sm:p-4" />
          <button ref={openerRef} type="button" onClick={() => { if (suppressClick.current) { suppressClick.current = false; return }; setExpanded(true) }} className="absolute inset-0 z-10 rounded-[var(--hf-radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--hf-brand)]" aria-label={`Enlarge ${productName}: ${current.label}`}>
            <span className="absolute right-3 top-3 grid size-11 place-items-center rounded-[var(--hf-radius-sm)] border border-black/15 bg-white"><ArrowsPointingOutIcon className="size-5" aria-hidden="true" /></span>
          </button>
        </> : player(false)}
      </div>
      {media.length > 1 && <>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-black/65" aria-live="polite" aria-atomic="true">{current.label} · {active + 1} of {media.length}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => move(-1)} className={arrowClass} aria-label="Previous product image or video"><ChevronLeftIcon className="size-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => move(1)} className={arrowClass} aria-label="Next product image or video"><ChevronRightIcon className="size-4" aria-hidden="true" /></button>
          </div>
        </div>
        <div ref={stripRef} className="relative mt-2 flex snap-x gap-2 overflow-x-auto overscroll-x-contain p-1 pb-3" aria-label="Product photos and videos">{thumbnails()}</div>
      </>}
      {current.kind === 'video' && <details className="mt-3 rounded-[var(--hf-radius-sm)] border border-black/10 bg-white px-4 py-3 text-sm leading-6 text-black/65"><summary className="cursor-pointer font-semibold text-[var(--hf-ink)]">Read the video demonstration</summary><p className="mt-3">{current.video.transcript}</p></details>}
      {expanded && createPortal(
        <dialog ref={dialogRef} aria-label={`${productName} image viewer`} onCancel={(event) => { event.preventDefault(); closeViewer() }} onClick={(event) => { if (event.target === event.currentTarget) closeViewer() }} onKeyDown={(event) => {
          if ((event.target as HTMLElement).closest('video')) return
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
        }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none bg-[#111713]/98 p-3 text-white backdrop:bg-black/80 sm:p-6">
          <div className="mx-auto flex h-full max-w-[1440px] flex-col">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{productName}</p><p className="mt-1 text-xs text-white/75" aria-live="polite">{current.label} · {active + 1} of {media.length}</p></div>
              <button type="button" autoFocus onClick={closeViewer} className="grid size-12 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 focus-visible:outline-2 focus-visible:outline-white" aria-label="Close image viewer"><XMarkIcon className="size-6" aria-hidden="true" /></button>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--hf-radius-lg)] bg-black/20" style={{ touchAction: 'pan-y pinch-zoom' }} onTouchStart={current.kind === 'image' ? onTouchStart : undefined} onTouchEnd={current.kind === 'image' ? onTouchEnd : undefined} onTouchCancel={() => { touchStart.current = null }}>
              {current.kind === 'image' ? <Image key={`expanded-${current.key}`} src={current.image.src} alt={current.image.alt || `${productName} — ${current.label.toLowerCase()}`} fill sizes="(max-width:1440px) 100vw, 1440px" className="object-contain p-2 sm:p-6" /> : player(true)}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => move(-1)} disabled={media.length < 2} className={`${arrowClass} disabled:opacity-40`} aria-label="Previous image"><ChevronLeftIcon className="size-5" aria-hidden="true" /></button>
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto p-1 pb-2" aria-label="Enlarged viewer thumbnails">{thumbnails(true)}</div>
              <button type="button" onClick={() => move(1)} disabled={media.length < 2} className={`${arrowClass} disabled:opacity-40`} aria-label="Next image"><ChevronRightIcon className="size-5" aria-hidden="true" /></button>
            </div>
          </div>
        </dialog>, document.body,
      )}
    </>
  )
}
