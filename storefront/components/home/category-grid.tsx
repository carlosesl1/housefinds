const categories = [
  { title: 'Smart Entry', copy: 'Smarter, safer entry with clever door solutions.', tone: 'bg-[#e9eee8]' },
  { title: 'Kitchen Tools', copy: 'Prep smarter. Cook happier with useful kitchen gadgets.', tone: 'bg-[#efe9df]' },
  { title: 'Space Saving', copy: 'Clever storage solutions for a more organized home.', tone: 'bg-[#e8e7de]' },
  { title: 'Daily Helpers', copy: 'Everyday solutions for a cleaner, easier home.', tone: 'bg-[#e7ece7]' },
]

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-[1480px] px-5 py-24 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[.28em] text-black/45">Shop by category</p>
          <h2 className="mt-4 text-5xl font-semibold tracking-[-.055em] md:text-7xl">
            Shop by <span className="text-[#507561]">category</span>
          </h2>
          <p className="mt-4 text-lg text-black/50">Clever products for every corner of the home.</p>
        </div>
        <p className="max-w-xs text-right text-sm italic text-[#507561]">Small changes. Happier homes.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category, i) => (
          <a
            href="/shop"
            key={category.title}
            className={`group min-h-80 rounded-[30px] p-6 ${category.tone} transition hover:-translate-y-1`}
          >
            <div className="flex h-full flex-col justify-between">
              <span className="text-sm text-black/40">0{i + 1}</span>
              <div>
                <h3 className="text-3xl font-semibold tracking-[-.04em]">{category.title}</h3>
                <p className="mt-3 max-w-xs text-black/55">{category.copy}</p>
                <span className="mt-6 inline-flex rounded-full border border-black/15 bg-white/60 px-4 py-2 text-sm font-medium">
                  Explore →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
