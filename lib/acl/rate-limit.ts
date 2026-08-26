import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Fixed window rate limiters per use case
const limiters = {
  default: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(30, '60s'), prefix: 'rl:default' }),
  booking: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '60s'), prefix: 'rl:booking' }),
  payment: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '60s'), prefix: 'rl:payment' }),
}

type LimiterKey = keyof typeof limiters

export async function checkRateLimit(
  identifier: string,
  limiter: LimiterKey = 'default',
): Promise<boolean> {
  const { success } = await limiters[limiter].limit(identifier)
  return success
}
