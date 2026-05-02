import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:auth',
  })
  return ratelimit
}

export async function checkRateLimit(
  request: Request,
): Promise<{ success: boolean; reset: number }> {
  const rl = getRatelimit()
  if (!rl) return { success: true, reset: 0 }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const result = await rl.limit(ip)
  return { success: result.success, reset: result.reset }
}

export function rateLimitResponse(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: 'Demasiados intentos. Esperá un minuto.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    },
  )
}
