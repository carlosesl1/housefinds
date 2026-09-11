import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'housefindsstore.com' },
      { protocol: 'https', hostname: '*.alicdn.com' },
      { protocol: 'https', hostname: '*.aliexpress-media.com' },
    ],
  },
}

export default nextConfig
