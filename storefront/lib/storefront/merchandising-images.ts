import type { WooProduct } from '@/lib/woocommerce/types'

// Existing WooCommerce photographs reviewed for the storefront. Only the listing
// preview changes; the full gallery and variant-specific media stay untouched.
const PREVIEW_IMAGE_IDS: Record<number, number[]> = {
  452: [439, 441],
  430: [406, 411],
  357: [356, 344],
  333: [319, 315],
  275: [270, 271],
  289: [281, 283],
  260: [251, 249],
}

export function merchandisingImages(product: WooProduct) {
  const images = product.images || []
  const selected = (PREVIEW_IMAGE_IDS[product.id] || [])
    .flatMap(id => images.find(image => image.id === id) || [])
  return [...selected, ...images.filter(image => !selected.some(pick => pick.id === image.id))]
}
