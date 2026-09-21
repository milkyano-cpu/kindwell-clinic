import { stripe } from './client'
import { redis } from '@/lib/redis'

// Cache Stripe price amounts for 1 hour — prices rarely change, and Stripe is source of truth
export async function getStripePrice(priceId: string): Promise<number> {
  const key = `stripe:price:${priceId}`
  if (redis) {
    const cached = await redis.get<number>(key)
    if (cached != null) return cached
  }
  const price = await stripe.prices.retrieve(priceId)
  const cents = price.unit_amount!
  if (redis) await redis.set(key, cents, { ex: 3600 })
  return cents
}
