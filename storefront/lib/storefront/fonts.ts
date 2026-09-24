import { Inter } from 'next/font/google'

// Shared functional family. Marketing fonts are loaded separately by page.
export const uiFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hf-ui',
  fallback: ['Arial', 'sans-serif'],
})
