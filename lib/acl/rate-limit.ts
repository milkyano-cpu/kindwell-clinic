import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

type LimiterKey = 'default' | 'booking' | 'payment'

let limiters: Record<LimiterKey, Ratelimit> | null = null

if (redis) {
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
