import { Cormorant_Garamond } from 'next/font/google'

// Only import in pages with editorial headings; never in the root layout.
// Next self-hosts and preloads these latin font resources on those routes.
export const editorialFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  preload: true,
  variable: '--font-hf-editorial',
  fallback: ['Georgia', 'serif'],
})
