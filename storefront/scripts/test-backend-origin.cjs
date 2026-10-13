const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { hasRemoteMatch } = require('next/dist/shared/lib/match-remote-pattern')
const root = path.resolve(__dirname, '..')

function load(file, env = {}, imports = {}) {
  const module = { exports: {} }
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  vm.runInNewContext(output.outputText, {
    module, exports: module.exports, process: { env }, URLSearchParams,
    require: name => {
      assert.ok(name in imports, `Unexpected import: ${name}`)
      return imports[name]
    },
  }, { filename: file })
  return module.exports
}

async function main() {
  for (const [env, origin] of [
    [{}, 'https://backend.housefindsstore.com'],
    [{ WOOCOMMERCE_URL: 'http://127.0.0.1:4010/' }, 'http://127.0.0.1:4010'],
  ]) {
    const requests = []
    const products = [{ id: 452 }]
    const client = load('lib/woocommerce/client.ts', env, {
      'server-only': {},
      './presentation': {},
      '@/lib/storefront/catalog': {},
      './transport': { commerceFetch: async url => {
        requests.push(url)
        return { ok: true, json: async () => products }
      } },
    })
    assert.deepEqual(await client.getProducts({ per_page: 16 }), products)
    assert.equal(requests[0], `${origin}/wp-json/wc/store/v1/products?per_page=16`)
    await client.getProductReviews(undefined, 8)
    assert.equal(new URL(requests[1]).origin, origin)
  }
  console.log('PASS catalogue and review reads use the backend and preserve configured overrides')

  const config = load('next.config.ts').default
  const allows = url => hasRemoteMatch([], config.images.remotePatterns, new URL(url))
  assert.equal(allows('https://backend.housefindsstore.com/wp-content/uploads/2026/10/product.webp'), true)
  assert.equal(allows('https://housefindsstore.com/wp-content/uploads/2026/09/product.webp'), true)
  assert.equal(allows('https://untrusted.example/product.webp'), false)
  assert.equal(allows('http://backend.housefindsstore.com/wp-content/uploads/product.webp'), false)
  console.log('PASS image optimizer accepts backend assets and rejects unrelated or insecure origins')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
