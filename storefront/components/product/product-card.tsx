import Image from 'next/image'
import Link from 'next/link'
import type { WooProduct } from '@/lib/woocommerce/types'
import { formatMoney } from '@/lib/woocommerce/client'

export function ProductCard({ product }: { product: WooProduct }) {
  const image = product.images?.[0]
  return <article className="group min-w-0"><Link href={`/produto/${product.slug}`} className="block"><div className="relative aspect-[4/4.7] overflow-hidden rounded-[28px] bg-[#f1efe8]">{image && <Image src={image.src} alt={image.alt || product.name} fill sizes="(max-width:768px) 70vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" />}{product.on_sale && <span className="absolute left-3 top-3 rounded-full bg-[#355f4a] px-3 py-1.5 text-xs font-semibold text-white">Sale</span>}</div><div className="mt-4"><h3 className="line-clamp-2 font-semibold tracking-tight">{product.name}</h3><div className="mt-2 flex items-end justify-between gap-2"><p className="text-lg font-semibold">{formatMoney(product.prices.price, product.prices.currency_minor_unit, product.prices.currency_symbol)}</p>{product.review_count > 0 && <span className="text-xs text-black/45">★ {product.average_rating} ({product.review_count})</span>}</div></div></Link></article>
