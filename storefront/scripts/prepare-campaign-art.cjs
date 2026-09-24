/* Deterministic local asset preparation; no network or product-data writes. */
const fs = require('node:fs/promises')
const path = require('node:path')
const crypto = require('node:crypto')
const sharp = require('sharp')
const root = path.resolve(__dirname, '../public/home/banners')
const crops = {
  kitchen: { left: .02, top: 0, width: .92, height: 1 },
  storage: { left: .01, top: 0, width: .90, height: 1 },
  budget: { left: .03, top: 0, width: .82, height: 1 },
}
async function main() {
  const outputDir = path.join(root, 'mobile')
  await fs.mkdir(outputDir, { recursive: true })
  const manifest = {}
  for (const [id, crop] of Object.entries(crops)) {
    const source = await fs.readFile(path.join(root, `${id}-scene.webp`))
    const meta = await sharp(source).metadata()
    if (!meta.width || !meta.height || meta.format !== 'webp') throw new Error(`Invalid scene: ${id}`)
    const region = {
      left: Math.floor(meta.width * crop.left), top: Math.floor(meta.height * crop.top),
      width: Math.floor(meta.width * crop.width), height: Math.floor(meta.height * crop.height),
    }
    const buffer = await sharp(source).extract(region)
      .resize(720, 600, { fit: 'cover', position: 'centre' })
      .webp({ quality: 76, effort: 6 }).toBuffer()
    if (buffer.length > 60000) throw new Error(`Mobile scene exceeds budget: ${id}`)
    await fs.writeFile(path.join(outputDir, `${id}-scene.webp`), buffer)
    manifest[id] = { width: 720, height: 600, bytes: buffer.length, crop: region,
      sourceSha256: crypto.createHash('sha256').update(source).digest('hex') }
  }
  await fs.writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log('Campaign mobile WebPs:', JSON.stringify(manifest))
}
main().catch(error => { console.error(error); process.exit(1) })
