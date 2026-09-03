import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type LimiterKey = 'default' | 'booking' | 'payment'

let limiters: Record<LimiterKey, Ratelimit> | null = null

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

if (REDIS_URL && REDIS_TOKEN) {
  const redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  })
  limiters = {
    default: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(30, '60s'), prefix: 'rl:default' }),
    booking: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '60s'), prefix: 'rl:booking' }),
    payment: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '60s'), prefix: 'rl:payment' }),
  }
}

export async function checkRateLimit(
  identifier: string,
  limiter: LimiterKey = 'default',
): Promise<boolean> {
  if (!limiters) return true
  const { success } = await limiters[limiter].limit(identifier)
  return success
}
