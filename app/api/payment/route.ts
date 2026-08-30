import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { createBookingCheckoutSession } from '@/lib/stripe/payment'
import { logger } from '@/lib/logger'

const schema = z.object({
  appointmentId: z.string().uuid(),
  consultationMode: z.enum(['telehealth', 'face-to-face']),
  appointmentType: z.enum(['initial', 'follow-up']),
  serviceCategory: z.enum(['alternative-medicine', 'smoking-cessation']),
  scheduleTime: z.string(),
})

export const POST = withACL(
  async (_, body: z.infer<typeof schema>) => {
    const session = await createBookingCheckoutSession({
      appointmentId: body.appointmentId,
      consultationMode: body.consultationMode,
      appointmentType: body.appointmentType,
      serviceCategory: body.serviceCategory,
      scheduleTime: body.scheduleTime,
    })

    await logger.log({
      event: 'booking.payment_initiated',
      appointmentId: body.appointmentId,
      stripePaymentIntentId: (session.payment_intent as string) ?? session.id,
      consultationMode: body.consultationMode,
      serviceCategory: body.serviceCategory,
      scheduleTime: body.scheduleTime,
    })

    return NextResponse.json({ url: session.url })
  },
  {
    schema,
    rateLimit: 'payment',
  },
)
