import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { getAvailableDatesForMonth } from '@/lib/medirecords/availability'
import { getFeeSchedule } from '@/lib/stripe/fee'

const querySchema = z.object({
  year: z.string().regex(/^\d{4}$/).transform(Number),
  month: z.string().regex(/^([1-9]|1[0-2])$/).transform(Number),
  mode: z.enum(['telehealth', 'face-to-face']),
  type: z.enum(['initial', 'follow-up']),
  service: z.enum(['alternative-medicine', 'smoking-cessation']),
  duration: z.string().regex(/^\d+$/).transform(Number).optional(),
  providerId: z.string().uuid().optional(),
})

export const GET = withACL(
  async (req: NextRequest) => {
    const params = Object.fromEntries(req.nextUrl.searchParams)
    const result = querySchema.safeParse(params)

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }

    const { year, month, mode, type, service, duration, providerId } = result.data
    const fee = getFeeSchedule(mode, type, service, duration)

    const availableDates = await getAvailableDatesForMonth({
      year,
      month,
      durationMinutes: fee.durationMinutes,
      providerId,
    })

    return NextResponse.json({ availableDates })
  },
  { rateLimit: 'default' },
)
