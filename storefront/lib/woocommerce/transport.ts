type RequestOptions = RequestInit & { next?: { revalidate?: number; tags?: string[] } }
type TransportOptions = { timeoutMs?: number; retries?: number; fetcher?: typeof fetch; sleep?: (ms: number) => Promise<void> }
const transient = new Set([408, 429, 500, 502, 503, 504])

export class CommerceConnectionError extends Error {
  constructor(public readonly uncertain: boolean) {
    super(uncertain ? 'The request outcome could not be confirmed.' : 'The shop is taking longer than usual to respond.')
    this.name = 'CommerceConnectionError'
  }
}

/** Buffer the body inside the deadline too. Never replay a cart or payment mutation. */
export async function commerceFetch(url: string, init: RequestOptions = {}, options: TransportOptions = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase()
  const safe = method === 'GET' && !new URL(url).pathname.includes('/checkout')
  const retries = safe ? Math.min(2, Math.max(0, options.retries ?? 1)) : 0
  const fetcher = options.fetcher || fetch
  const sleep = options.sleep || ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const timeoutMs = options.timeoutMs ?? (safe ? 7000 : 20000)
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const abort = () => controller.abort()
    if (init.signal?.aborted) abort()
    init.signal?.addEventListener('abort', abort, { once: true })
    const timer = setTimeout(abort, timeoutMs)
    try {
      const response = await fetcher(url, { ...init, signal: controller.signal })
      const body = await response.text()
      if (safe && transient.has(response.status) && attempt < retries) {
        const retryAfter = Number(response.headers.get('retry-after'))
        if (!Number.isFinite(retryAfter) || retryAfter <= 2) {
          await sleep(Math.max(250 * (attempt + 1), (retryAfter || 0) * 1000))
          continue
        }
      }
      // An already-consumed response must not retain compressed content lengths.
      const headers = new Headers(response.headers)
      headers.delete('content-encoding')
      headers.delete('content-length')
      return new Response([204, 205, 304].includes(response.status) ? null : body, { status: response.status, statusText: response.statusText, headers })
    } catch {
      if (init.signal?.aborted) throw new CommerceConnectionError(!safe)
      if (safe && attempt < retries) { await sleep(250 * (attempt + 1)); continue }
      console.error('[housefinds-upstream]', { method, path: new URL(url).pathname, attempts: attempt + 1, outcome: safe ? 'unavailable' : 'unconfirmed' })
      throw new CommerceConnectionError(!safe)
    } finally {
      clearTimeout(timer)
      init.signal?.removeEventListener('abort', abort)
    }
  }
  throw new CommerceConnectionError(!safe)
}
