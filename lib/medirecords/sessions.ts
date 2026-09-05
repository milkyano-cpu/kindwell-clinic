import { mrClient } from './client'
import { redis } from '@/lib/redis'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!

export interface MRRegularSession {
  id: string
  userId: string
  dayOfWeek: number // 1=Sun 2=Mon 3=Tue 4=Wed 5=Thu 6=Fri 7=Sat 8=Mon-Sat
  startTime: string // "HH:MM"
  endTime: string   // "HH:MM"
  startDate: string // "YYYY-MM-DD"
  endDate: string   // "YYYY-MM-DD"
}

export async function getProviderRegularSessions(providerId: string): Promise<MRRegularSession[]> {
  const cacheKey = `sessions:${PRACTICE_ID}:${providerId}`

  if (redis) {
    const cached = await redis.get<MRRegularSession[]>(cacheKey)
    if (cached) return cached
  }

  const res = await mrClient.get<{ data: MRRegularSession[] }>(
    `/v1/practices/${PRACTICE_ID}/regular-sessions?userId=${providerId}&size=100`,
  )
  const sessions = res.data ?? []

  if (redis && sessions.length > 0) {
    await redis.set(cacheKey, sessions, { ex: 3600 })
  }

  return sessions
}

// Returns true if the session covers the given date (YYYY-MM-DD)
export function sessionActiveOnDate(session: MRRegularSession, date: string): boolean {
  if (date < session.startDate || date > session.endDate) return false
  // Use noon to avoid DST edge cases
  const jsDay = new Date(`${date}T12:00:00`).getDay() // 0=Sun..6=Sat
  const mrDay = jsDay + 1 // align to MediRecords: 1=Sun..7=Sat
  if (session.dayOfWeek === 8) return jsDay >= 1 && jsDay <= 6 // Mon-Sat
  return session.dayOfWeek === mrDay
}
