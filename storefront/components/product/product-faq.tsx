import Link from 'next/link'
import type { WooProduct } from '@/lib/woocommerce/types'
import { displayProductName } from '@/lib/woocommerce/presentation'

type FAQ = { q: string; a: React.ReactNode }

type Rule = [RegExp, FAQ[]]

const productRules: Rule[] = [
  [/oil spray|oil brush/i, [
    { q: 'What is it useful for?', a: 'Everyday cooking where you want more control over how oil reaches the pan or food — frying, roasting, grilling and finishing.' },
    { q: 'What should I check before choosing an option?', a: 'Choose the capacity or finish you actually want from the options above. Different options can have different prices, so the selected price is the one that matters.' },
    { q: 'Can I use very thick sauces in it?', a: 'We would not assume that. Thick liquids can behave differently in spray mechanisms; unless the selected option explicitly says otherwise, use it for free-flowing cooking oils.' },
  ]],
  [/cutting board|chopping board/i, [
    { q: 'What is this board intended for?', a: 'Everyday kitchen prep such as fruit, vegetables, meat and general chopping. Use separate prep practices where food-safety guidance calls for them.' },
    { q: 'Is it dishwasher safe?', a: 'We have not verified a dishwasher-safe claim across every version, so Housefinds does not promise it. Follow the care information supplied with the product.' },
  ]],
  [/shoe washing|wash bag/i, [
    { q: 'Will it fit every shoe?', a: 'Shoe size and shape vary, so do not assume universal fit. Check the selected option and product imagery before ordering, particularly for bulky footwear.' },
    { q: 'Does the bag make every shoe machine-washable?', a: 'No. The bag helps contain and protect footwear during washing, but the shoe manufacturer’s own cleaning instructions still decide whether that shoe should go in a washing machine.' },
  ]],
  [/toothbrush holder/i, [
    { q: 'Why use a covered holder?', a: 'It keeps everyday toothbrushes organised, covered between uses and off the bathroom counter.' },
    { q: 'Will it work on every wall surface?', a: 'Wall condition and the supplied fixing method matter. Clean, suitable surfaces generally give adhesive-style fittings a better chance of holding; do not rely on an unverified load claim.' },
  ]],
  [/shoe storage|shoe rack|x-type/i, [
    { q: 'Where does this rack make the most sense?', a: 'Entryways, bedrooms and other places where using vertical space can reduce the footprint of loose shoes.' },
    { q: 'How many pairs will it hold?', a: 'Capacity can vary with the selected version and shoe size. Use the product option and imagery rather than assuming one capacity across every version.' },
  ]],
  [/spoon scale|digital spoon/i, [
    { q: 'What is a spoon scale best for?', a: 'Small ingredients that are easier to scoop and weigh in one motion — for example coffee, baking ingredients and powders.' },
    { q: 'What accuracy and maximum weight does it support?', a: 'Those are technical specifications we do not want to guess. Housefinds will show a verified figure once it is confirmed for the exact option being sold.' },
  ]],
  [/bath mat|floor mat/i, [
    { q: 'Where should I use it?', a: 'On a suitable bathroom floor where a softer landing and extra everyday grip are useful.' },
    { q: 'Does “non-slip” mean it can never move?', a: 'No mat should be treated as impossible to move on every surface. Keep the floor and underside clean and follow the product care guidance.' },
  ]],
  [/door closer|surface door stop/i, [
    { q: 'Does it require drilling?', a: 'This product is presented as a punch-free installation concept. The actual fixing method and surface condition still matter, so inspect the supplied installation parts before fitting.' },
    { q: 'Will it close any door?', a: 'Door weight, hinge resistance and installation position affect any closer. Housefinds does not claim universal compatibility without a verified door-weight specification for the selected option.' },
    { q: 'Where is it most useful?', a: 'Everyday internal doors that are regularly left open or need a simple automatic closing action.' },
  ]],
  [/mosquito racket|insect killer/i, [
    { q: 'Where can I use it?', a: 'It is intended as a practical handheld helper for flying insects around indoor living spaces and suitable outdoor areas.' },
    { q: 'Is it a toy or safe for children to handle?', a: 'No. It is an electric insect-control product and should be kept away from children and handled according to the safety instructions supplied with it.' },
  ]],
  [/motion sensor led|led bar light|induction night light/i, [
    { q: 'Where is motion lighting most useful?', a: 'Wardrobes, cupboards, bedside areas, kitchens and other dark corners where you want light without reaching for a switch.' },
    { q: 'Does it stay on continuously?', a: 'This listing is built around motion-sensor lighting, but operating modes can differ by option. Check the selected option and the controls supplied with it.' },
    { q: 'How is it charged?', a: 'The current product is presented as rechargeable. Where the selected option specifies USB-C, use a compatible power source and the supplied charging guidance.' },
  ]],
  [/homefish|aurora projector|ocean wave/i, [
    { q: 'What is the projector designed for?', a: 'Ambient lighting — adding moving colour and atmosphere to bedrooms, desks and quiet corners rather than replacing normal task lighting.' },
    { q: 'Can I change the colours?', a: 'The current listing includes multiple RGB colour modes and remote-controlled adjustments. Available effects can depend on the selected option.' },
  ]],
]

function productFAQs(product: WooProduct) {
  const rule = productRules.find(([pattern]) => pattern.test(product.name))
  return rule?.[1] || []
}

export function ProductFAQ({ product }: { product: WooProduct }) {
  const name = displayProductName(product.name)
  const specific = productFAQs(product)
  const common: FAQ[] = [
    { q: 'How much is UK delivery?', a: <>Standard UK delivery is free. The current delivery estimate is around 14 days and is not a guaranteed arrival date. <Link href="/shipping" className="font-semibold text-[var(--hf-brand)] underline underline-offset-3">Delivery details</Link>.</> },
    { q: 'What if it arrives damaged, faulty or incorrect?', a: <>Contact Housefinds as soon as possible. For the fastest resolution, send the order number plus a short video or clear photos where reasonably practical. Where appropriate, we’ll arrange a refund or replacement. <Link href="/returns" className="font-semibold text-[var(--hf-brand)] underline underline-offset-3">Returns & problems</Link>.</> },
    { q: 'Can I return it if I change my mind?', a: <>Eligible online orders have free 14-day returns. Tell Housefinds within 14 days of delivery and follow the return instructions provided for that order.</> },
  ]
  const faqs = [...specific, ...common]

  return (
    <section className="hf-section relative overflow-hidden border-t border-black/[.06] bg-[#f3f4ef]">
      <div className="pointer-events-none -left-32 top-10 absolute size-80 rounded-full bg-white/55 blur-[110px]" />
      <div className="pointer-events-none -right-20 bottom-4 absolute size-72 rounded-full bg-[#dfe8e1]/45 blur-[100px]" />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-6 lg:grid-cols-[.68fr_1.32fr] lg:gap-20">
        <div>
          <p className="hf-eyebrow text-[var(--hf-brand-muted)]">Product questions</p>
          <h2 className="mt-4 max-w-md text-[clamp(2.35rem,3.2vw,3.45rem)] font-semibold leading-[.98] tracking-[-.046em] text-[var(--hf-ink)]">Useful things to know before you order.</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-black/45">Product-specific answers for {name}, followed by the delivery and returns essentials.</p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => (
            <details key={faq.q} className="group overflow-hidden rounded-[var(--hf-radius-md)] border border-black/[.065] bg-white/76 px-5 shadow-[0_10px_30px_rgba(38,52,42,.035)] backdrop-blur-sm sm:px-6" open={index === 0 && specific.length > 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left">
                <span className="text-[16px] font-semibold leading-6 tracking-[-.018em] text-[var(--hf-ink)] sm:text-[17px]">{faq.q}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/[.09] bg-[#f7f8f5] text-lg text-black/45 transition duration-200 group-open:rotate-45 group-open:bg-[var(--hf-brand-soft)] group-open:text-[var(--hf-brand)]">+</span>
              </summary>
              <div className="max-w-3xl border-t border-black/[.055] pb-6 pt-4 pr-8 text-sm leading-7 text-black/55">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
