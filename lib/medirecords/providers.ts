import { mrClient } from './client'
import type { MRPage } from './types'
import { redis } from '@/lib/redis'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!
const CACHE_TTL = 3600 // 1 hour

export interface MRProvider {
  id: string
  titleCode: string
  firstName: string
  lastName: string
  status: string
}

export async function getProviders(): Promise<MRProvider[]> {
  const cacheKey = `providers:${PRACTICE_ID}`

  if (redis) {
    const cached = await redis.get<MRProvider[]>(cacheKey)
    if (cached) return cached
  }

  const res = await mrClient.get<MRPage<MRProvider>>(
    `/v1/practices/${PRACTICE_ID}/providers?status=Active&size=100`,
  )
  const providers = (res.data ?? []).map(p => ({
    id: p.id,
    titleCode: p.titleCode,
    firstName: p.firstName,
    lastName: p.lastName,
    status: p.status,
  }))

  if (redis && providers.length > 0) {
    await redis.set(cacheKey, providers, { ex: CACHE_TTL })
  }

  return providers
}
