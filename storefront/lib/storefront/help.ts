export type HelpDestination = {
  title: string
  href: string
  description: string
  keywords: string[]
}

export const HELP_DESTINATIONS: HelpDestination[] = [
  {
    title: 'Track an order',
    href: '/track-order',
    description: 'Check order status and carrier tracking when it becomes available.',
    keywords: ['track', 'tracking', 'order status', 'where is my order', 'parcel', 'package', 'shipment', 'delivery update'],
  },
  {
    title: 'Shipping & delivery',
    href: '/shipping',
    description: 'Free UK delivery, current timing and split-shipment information.',
    keywords: ['shipping', 'delivery', 'postage', 'free delivery', 'how long', '14 days', 'when arrive', 'arrival', 'uk delivery'],
  },
  {
    title: 'Returns & refunds',
    href: '/returns',
    description: 'Free 14-day returns and what to do with damaged, faulty or incorrect items.',
    keywords: ['return', 'returns', 'refund', 'money back', 'change mind', 'damaged', 'faulty', 'broken', 'incorrect', 'wrong item', 'replacement', 'problem'],
  },
  {
    title: 'Housefinds FAQ',
    href: '/faq',
    description: 'Answers about delivery, payments, reviews, returns and product options.',
    keywords: ['faq', 'help', 'question', 'payment', 'review', 'reviews', 'support', 'how does'],
  },
  {
    title: 'Contact Housefinds',
    href: '/contact',
    description: 'Customer support for orders, products, delivery and returns.',
    keywords: ['contact', 'email', 'support', 'customer service', 'speak', 'help me', 'contact housefinds'],
  },
]

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9£]+/g, ' ').replace(/\s+/g, ' ')
}

export function searchHelp(query: string) {
  const q = normalize(query)
  if (!q) return []
  const words = q.split(' ').filter(Boolean)

  return HELP_DESTINATIONS
    .map((destination) => {
      const haystack = normalize([destination.title, destination.description, ...destination.keywords].join(' '))
      const exact = destination.keywords.some((keyword) => q.includes(normalize(keyword)) || normalize(keyword).includes(q))
      const wordMatches = words.filter((word) => haystack.includes(word)).length
      const score = (exact ? 10 : 0) + wordMatches
      return { destination, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.destination)
    .slice(0, 4)
}
