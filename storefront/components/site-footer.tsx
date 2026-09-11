import Link from 'next/link'

const groups = [
  { title: 'Shop', links: ['New In', 'Best Sellers', 'Kitchen Tools', 'Smart Entry', 'Home Organization', 'All Products'] },
  { title: 'Customer Care', links: ['Shipping', 'Returns', 'FAQ', 'Contact Us', 'Track Your Order'] },
  { title: 'Company', links: ['About Us', 'Our Mission', 'Privacy Policy', 'Terms of Service'] },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-[#f7f6f2]">
      <div className="mx-auto grid max-w-[1480px] gap-12 px-5 py-16 lg:grid-cols-[1.2fr_2fr_1.25fr] lg:px-8">
        <div>
          <Link href="/" className="text-3xl font-bold tracking-[-.05em]">Housefinds</Link>
          <p className="mt-4 max-w-xs text-lg text-black/55">Clever, useful products for a happier home.</p>
          <p className="mt-6 max-w-sm text-sm leading-6 text-black/45">We curate practical home gadgets and everyday solutions that make small parts of life easier.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold">{group.title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-black/50">
                {group.links.map((link) => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[.25em] text-black/45">Stay in the loop</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Home inspiration,<br /><span className="text-[#507561]">straight to your inbox.</span></h3>
          <form className="mt-6 flex overflow-hidden rounded-full border border-black/10 bg-white">
            <input className="min-w-0 flex-1 bg-transparent px-5 py-3 outline-none" placeholder="Enter your email" />
            <button className="m-1 rounded-full bg-[#355f4a] px-5 text-white">→</button>
          </form>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-5 py-6 text-xs text-black/45 sm:flex-row sm:justify-between lg:px-8">
          <span>© 2026 Housefinds. All rights reserved.</span>
          <span>Small changes. Bigger living.</span>
        </div>
      </div>
    </footer>
  )
}
