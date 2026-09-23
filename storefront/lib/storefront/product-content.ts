/** Editorial PDP content, tied to exact Woo product IDs, never inferred for a new import.
 * Sources and deliberately withheld claims are recorded in docs/pdp-content-notes.md.
 * Keep supplier HTML, fulfilment data and video IDs out of client props.
 */
export type ProductStep = { title: string; text: string }
export type ProductFact = { label: string; value: string }
export type ProductVideo = { src: string; poster: string; title: string; captions?: string; transcript: string }
export type ProductContent = {
  match: RegExp
  highlights: string[]
  detail: string
  guide: { title: string; points: ProductFact[] }
  facts: ProductFact[]
  included?: string
  care?: string
  steps?: { title: string; items: ProductStep[]; note?: string }
  questions: { q: string; a: string }[]
  video?: ProductVideo
}

const content: Record<number, ProductContent> = {
  399: {
    match: /door closer/i,
    highlights: ['Automatic pull-cord closing', 'White or black finish', 'Choice of closing force'],
    detail: 'A retracting cord provides the closing action. Choose the finish separately from the pull force, and check compatibility with the resistance of your door.',
    guide: { title: 'Choosing your closing force', points: [
      { label: 'Colour', value: 'Choose the finish that suits your door. Colour and closing force are separate choices.' },
      { label: 'Closing force', value: 'The g values identify the pull-force options, not the weight of door they can close. Door resistance and fitting position also matter.' },
      { label: 'Compatibility', value: 'For a specific door, ask us about fit before ordering. This item is not offered as a certified fire-door closer.' },
    ] },
    facts: [{ label: 'Mechanism', value: 'Retracting pull cord' }, { label: 'Fitting style', value: 'Punch-free design; follow the supplied fixing instructions' }],
    questions: [
      { q: 'What do the force options mean?', a: 'They identify different pull-force versions of the closer. They are not door-weight ratings. Choose the colour and force separately; the price updates for that combination.' },
      { q: 'Will it work with my door?', a: 'Closing depends on hinge resistance, the door and the fitting position. Contact us with your door details for compatibility help. Do not use this listing as a substitute for a certified fire-door closer.' },
      { q: 'Does it need drilling?', a: 'The listing describes a punch-free fixing design. Follow the supplied installation instructions for the fixing parts and surface you are using.' },
    ],
  },
  452: {
    match: /cutting board|chopping/i,
    highlights: ['Stainless steel surface', 'Double-sided food prep', 'Choice of board size'],
    detail: 'Choose a prep surface that fits the way you cook. Compare the dimensions with your worktop and storage space rather than judging size from a close-up photo.',
    guide: { title: 'Find the right board size', points: [
      { label: 'Measure your space', value: 'Compare the listed length and width with your worktop, sink and storage space.' },
      { label: 'Choose the actual size', value: 'Use the dimensions on the option buttons. Each option is one board, not a set of every size shown.' },
    ] },
    facts: [{ label: 'Material', value: 'Stainless steel' }, { label: 'Use', value: 'Everyday food preparation' }],
    included: 'One stainless steel cutting board in the selected size.',
    care: 'Clean after use and dry before storing. Keep preparation of raw meat separate from ready-to-eat food. Follow the care instructions supplied with your board.',
    questions: [
      { q: 'Which sizes can I order?', a: 'The option buttons show the sizes available in this listing. Measure your prep area and storage space, then select the dimensions you need.' },
      { q: 'Do I receive one board or a set?', a: 'One board in the size you select. Photos showing several boards illustrate the different sizes.' },
      { q: 'Can I put it in the dishwasher?', a: 'Use the care instructions supplied with your board. We recommend hand cleaning while dishwasher suitability for each version is being confirmed.' },
    ],
  },
  430: {
    match: /oil spray|oil brush/i,
    highlights: ['Refillable bottle', 'See the oil level at a glance', 'Capacity and set options'],
    detail: 'The transparent body lets you see when a refill is due. Capacity is per bottle, while the set option controls how many bottles you receive.',
    guide: { title: 'Capacity, colour and set explained', points: [
      { label: 'Capacity', value: 'The ml value is the capacity of each bottle, not the combined capacity of a set.' },
      { label: 'Set', value: 'Choose the single-bottle option or a labelled multi-pack. Select the capacity and colour combination before adding it to your basket.' },
      { label: 'Accessories', value: 'Choose from the options listed here. A brush shown in supplier photography is not automatically an extra included accessory.' },
    ] },
    facts: [{ label: 'Body material', value: 'Plastic' }, { label: 'Format', value: 'Refillable cooking-oil bottle' }, { label: 'Cleaning', value: 'Hand wash only; not dishwasher-safe' }],
    included: 'The bottle option or bottle set selected above. Pack quantity and capacity depend on that selection.',
    care: 'Wash by hand. Do not put the bottle in the dishwasher or leave it soaking in hot water.',
    steps: { title: 'From refill to food prep.', items: [
      { title: 'Fill', text: 'Add a free-flowing cooking oil and refit the bottle top securely.' },
      { title: 'Apply', text: 'Test the spray, then apply the amount you need for preparation. Keep it away from an open flame.' },
      { title: 'Clean', text: 'Wash by hand between uses. Avoid the dishwasher and prolonged hot-water soaking.' },
    ] },
    questions: [
      { q: 'Is the capacity per bottle?', a: 'Yes. Capacity describes each bottle. Choose the set separately to decide how many bottles you order.' },
      { q: 'Is it dishwasher-safe?', a: 'No. The product instructions specify hand washing and advise against prolonged immersion in hot water.' },
      { q: 'Can I use thick sauces?', a: 'Use free-flowing cooking oil in the spray mechanism. Thick sauces may not spray properly.' },
    ],
  },
  382: {
    match: /toothbrush holder/i,
    highlights: ['Covered brush storage', 'Wall-mounted design', 'More room around the sink'],
    detail: 'Move brush storage off the counter and keep a cover over the brush head between uses. Select one holder or a pair for the space around your sink.',
    guide: { title: 'Choose your finish and quantity', points: [
      { label: 'Finish', value: 'Use the colour buttons for the finishes currently available.' },
      { label: 'Quantity', value: '1PC is one holder; 2PCS is a two-holder set. Toothbrushes shown in the photographs are not included.' },
      { label: 'Fit', value: 'Compare the holder dimensions with your brush head and the space where you plan to fit it.' },
    ] },
    facts: [{ label: 'Material', value: 'Plastic' }, { label: 'Listed holder dimensions', value: 'Approximately 23.5 × 30.5 × 46 mm' }, { label: 'Placement', value: 'Wall-mounted brush storage' }],
    included: 'One or two holders, according to the selected set. Toothbrushes are not included.',
    care: 'Clean the holder regularly and let it dry. Follow the supplied fixing instructions for the wall surface.',
    questions: [
      { q: 'How many holders are included?', a: 'The selected set determines the quantity: 1PC is one holder and 2PCS is two holders.' },
      { q: 'Will my toothbrush fit?', a: 'The listed holder dimensions are approximately 23.5 × 30.5 × 46 mm. Brush heads vary, so compare your brush with the opening and product photos before choosing.' },
      { q: 'Does the set include toothbrushes?', a: 'No. This listing is for the holders; toothbrushes in the photos show how they are used.' },
    ],
  },
  357: {
    match: /shoe washing|wash bag/i,
    highlights: ['Zip-up shoe wash bag', 'Reusable polyester fabric', 'Keeps footwear contained'],
    detail: 'The zip holds suitable footwear inside the reusable bag during washing. The bag adds containment; the shoe care label still determines the cycle and temperature.',
    guide: { title: 'Check your shoes before washing', points: [
      { label: 'Shoe care', value: 'The bag does not make every shoe machine-washable. Follow the footwear maker’s care label.' },
      { label: 'Fit', value: 'The shoe should fit without forcing the zip. Contact us for size help with bulky footwear.' },
    ] },
    facts: [{ label: 'Material', value: 'Polyester' }, { label: 'Closure', value: 'Zip' }, { label: 'Colour', value: 'Yellow; zip and handle colour can vary by batch' }],
    included: 'One shoe washing bag. Shoes are not included.',
    care: 'The listing recommends washing the empty bag inside out before its first use. Follow your shoes’ care label for the wash cycle and temperature.',
    steps: { title: 'A simpler shoe-washing routine.', items: [
      { title: 'Check the care label', text: 'Only use the machine for footwear whose maker permits machine washing.' },
      { title: 'Place inside and zip up', text: 'Put the shoe inside without forcing the fit and close the zip fully.' },
      { title: 'Wash as directed', text: 'Use the cycle recommended for the footwear. Remove the shoe and follow its drying instructions.' },
    ] },
    questions: [
      { q: 'Does this make any shoe machine-washable?', a: 'No. The footwear maker’s care instructions decide whether a shoe can go in the machine. The bag is for containing suitable footwear during washing.' },
      { q: 'Is the zip always blue?', a: 'No. The supplier notes that zip and handle colours can vary between batches, including blue or white.' },
      { q: 'Should I wash the bag before using it?', a: 'Yes. The listing recommends washing the empty bag inside out before using it to wash shoes.' },
    ],
  },
  333: {
    match: /spoon scale|digital.*scale/i,
    highlights: ['Weigh as you scoop', 'Digital weight display', 'Choose a single spoon or pair'],
    detail: 'Bring scooping and weighing into one tool for kitchen ingredients. Remember to add a CR2032 battery to your shopping list: it is not supplied with the spoon.',
    guide: { title: 'Choose a spoon or a pair', points: [
      { label: 'Set', value: 'Options beginning with 2PCS contain two spoons. Other colour options are single-spoon versions.' },
      { label: 'Power', value: 'Each spoon uses one CR2032 button battery, which is not included.' },
      { label: 'Weighing capacity', value: 'The imported listing contains conflicting maximum-weight figures. Contact us before ordering for a specific weighing range.' },
    ] },
    facts: [{ label: 'Power', value: 'One CR2032 button battery per spoon' }, { label: 'Battery included', value: 'No' }, { label: 'Units', value: 'g / oz' }, { label: 'Body material', value: 'Plastic' }],
    included: 'One or two digital spoon scales, according to the selected option. Batteries are not included.',
    care: 'Keep the electronic handle dry. Keep button batteries away from children and follow the supplied battery and cleaning instructions.',
    questions: [
      { q: 'Is a battery included?', a: 'No. Each spoon needs one CR2032 button battery, supplied separately.' },
      { q: 'Is this a single spoon or a pair?', a: 'Choose an option marked 2PCS for two spoons. The other colour options contain one spoon.' },
      { q: 'What is the maximum weighing capacity?', a: 'The source listing and an imported option give different maximum-weight figures. We are not presenting either as a confirmed rating. Contact us before buying for a specific weighing range.' },
    ],
  },
  289: {
    match: /motion sensor.*led|led bar light/i,
    highlights: ['Motion-sensor lighting', 'USB-C rechargeable', 'Length and light-colour options'],
    detail: 'Fit the length to your cupboard or bedside space, then choose the light tone. The two-piece options let you order a matching pair of the stated length.',
    guide: { title: 'Choose the light for your space', points: [
      { label: 'Light colour', value: 'Warm white gives a warmer tone; cool white gives a cooler tone. The 3-colour option offers a choice of tones in the same lamp.' },
      { label: 'Length and set', value: 'Measure the mounting space. An option labelled 2 pieces contains two lamps of the stated length.' },
      { label: 'Power', value: 'This is rechargeable lighting. Follow the supplied charging instructions; the listing specifies a 5V input.' },
    ] },
    facts: [{ label: 'Power source', value: 'Rechargeable battery' }, { label: 'Charging connection', value: 'USB-C' }, { label: 'Listed input', value: '5V' }, { label: 'Body material', value: 'ABS' }],
    care: 'Keep the charging connection dry. Use the power specification and mounting instructions supplied with the selected lamp.',
    questions: [
      { q: 'What does “2 pieces” mean?', a: 'It is a set of two lamps, each in the length stated by that option.' },
      { q: 'How do I choose the light colour?', a: 'Warm white and cool white are different light tones. Choose the 3-colour option to select between tones on the same lamp.' },
      { q: 'How is it charged?', a: 'This listing is for USB-C rechargeable lamps with a listed 5V input. Follow the charging instructions supplied with your lamp.' },
    ],
  },
  275: {
    match: /shoe.*rack|shoe storage/i,
    highlights: ['Four-tier storage', 'X-shaped frame', 'Uses vertical space'],
    detail: 'Stack storage vertically instead of spreading shoes along the floor. Compare the selected version and allow clearance for the footwear you use every day.',
    guide: { title: 'Make room for the right rack', points: [
      { label: 'Version', value: 'A, B and C identify the listed rack versions. Compare the selected option image, not just the first gallery photo.' },
      { label: 'Placement', value: 'Allow room for the rack, your shoes and any nearby door to open. Shoe capacity depends on footwear size.' },
    ] },
    facts: [{ label: 'Layout', value: 'Four tiers' }, { label: 'Frame', value: 'Metal' }, { label: 'Listed component material', value: 'PP' }],
    care: 'Assemble using the supplied instructions and use on a level surface. Do not use the rack as a seat or step.',
    questions: [
      { q: 'How many pairs does it hold?', a: 'The rack has four tiers. The number of pairs depends on shoe size and the version selected, so use the product photos to compare the layout.' },
      { q: 'Are all the versions the same?', a: 'The listing includes A, B and C versions. Choose the version first and review its image before adding it to your basket.' },
    ],
  },
  260: {
    match: /bath mat|floor mat/i,
    highlights: ['Soft surface underfoot', 'Grey finish', '40 × 60 cm format'],
    detail: 'A 40 × 60 cm grey mat for the bathroom floor. Leave clearance for doors to open and keep the underside clean and dry for everyday use.',
    guide: { title: 'Check the space by your shower', points: [
      { label: 'Size', value: 'The listed option is 40 × 60 cm. Check clearance for nearby doors and furniture.' },
      { label: 'Placement', value: 'Use on a suitable clean, dry bathroom floor. A non-slip description does not mean a mat cannot move on any surface.' },
    ] },
    facts: [{ label: 'Listed size', value: '40 × 60 cm' }, { label: 'Colour', value: 'Grey' }, { label: 'Placement', value: 'Bathroom floor' }],
    care: 'Keep the floor and underside clean and dry. Follow the supplied washing instructions and let the mat dry before putting it back.',
    questions: [
      { q: 'What size is the mat?', a: 'The current option is listed as 40 × 60 cm. Measure the intended floor space before ordering.' },
      { q: 'Can it move on the floor?', a: 'It can. Grip depends on the surface and conditions. Keep the floor and underside clean and dry, and reposition the mat if it shifts.' },
    ],
  },
  264: {
    match: /mosquito racket|insect killer/i,
    highlights: ['Extendable handle design', 'Rotating head', 'Handheld insect control'],
    detail: 'The retractable handle and rotating head change how you position the racket. Follow the supplied handling instructions and keep it away from water and children.',
    guide: { title: 'Before using an electric racket', points: [
      { label: 'Handling', value: 'This is an electric insect-control product, not a toy. Follow the instructions supplied with the item.' },
      { label: 'Safety', value: 'Keep away from children, water and flammable sprays. Do not touch the electrical mesh.' },
    ] },
    facts: [{ label: 'Format', value: 'Handheld electric insect racket' }, { label: 'Design', value: 'Retractable handle and rotating head' }],
    care: 'Switch off before storage. Keep the electrical mesh dry and follow the supplied instructions for safe use and cleaning.',
    questions: [
      { q: 'Is it safe for children to use?', a: 'No. This is not a toy. Keep it away from children and do not touch the electrical mesh.' },
      { q: 'Can I use it near water or insect spray?', a: 'Keep the racket away from water and flammable sprays. Follow the safety instructions supplied with the product.' },
    ],
  },
}

export function getProductContent(product: { id: number; name: string }): ProductContent | undefined {
  const entry = content[product.id]
  return entry?.match.test(product.name) ? entry : undefined
}

/** Parse only explicitly dimensioned options, not capacities, forces or supplier prose. */
export function dimensionOptions(values: string[]) {
  return Array.from(new Set(values)).flatMap((value) => {
    const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:cm)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm$/i)
    if (!match) return []
    const width = Number(match[1]); const length = Number(match[2])
    if (width <= 0 || length <= 0 || width > 500 || length > 500) return []
    return [{ width, length, label: `${width} × ${length} cm` }]
  }).filter((size, index, all) => all.findIndex((candidate) => candidate.label === size.label) === index).sort((a, b) => a.width * a.length - b.width * b.length)
}

export function ratingFill(rating: number) {
  const value = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0
  return Array.from({ length: 5 }, (_, index) => Math.max(0, Math.min(1, value - index)) * 100)
}

/** Only reviewed, first-party video assets are accepted. Never construct a URL from an opaque video ID. */
export function approvedProductVideo(video?: ProductVideo): ProductVideo | undefined {
  if (!video?.title.trim() || !video.transcript.trim()) return undefined
  const safeAsset = (value: string, extension: RegExp) => {
    try {
      const url = new URL(value, 'https://housefindsstore.com')
      const local = value.startsWith('/media/') && !value.startsWith('//') && !value.includes('..')
      const hosted = url.origin === 'https://housefindsstore.com' && url.pathname.startsWith('/wp-content/uploads/')
      return (local || hosted) && !url.search && !url.hash && extension.test(url.pathname)
    } catch { return false }
  }
  if (!safeAsset(video.src, /\.(mp4|webm)$/i) || !safeAsset(video.poster, /\.(webp|png|jpe?g)$/i)) return undefined
  if (video.captions && !safeAsset(video.captions, /\.vtt$/i)) return undefined
  return video
}
