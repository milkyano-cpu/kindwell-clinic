import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { getAvailableSlots } from '@/lib/medirecords/availability'
import { getFeeSchedule } from '@/lib/stripe/fee'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
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

    const { date, mode, type, service, duration, providerId } = result.data
    const fee = getFeeSchedule(mode, type, service, duration)

    const slots = await getAvailableSlots({
      date,
      durationMinutes: fee.durationMinutes,
      providerId,
    })

    return NextResponse.json({
      date,
      slots, // { time: string; available: boolean }[]
      fee: {
        grossCents: fee.grossCents,
        medicareRebateCents: fee.medicareRebateCents,
        outOfPocketCents: fee.outOfPocketCents,
        durationMinutes: fee.durationMinutes,
      },
    })
  },
  { rateLimit: 'default' },
)
