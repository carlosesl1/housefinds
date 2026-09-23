import { Cormorant_Garamond, Inter } from 'next/font/google'

// Self-hosted by Next at build time. No font-provider requests from shoppers.
export const uiFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hf-ui',
  fallback: ['Arial', 'sans-serif'],
})

// Loaded on demand: checkout and purchase controls never use the display face.
export const editorialFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  preload: false,
  variable: '--font-hf-editorial',
  fallback: ['Georgia', 'serif'],
})
