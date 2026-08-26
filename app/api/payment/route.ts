import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { createBookingPaymentIntent } from '@/lib/stripe/payment'
import { logger } from '@/lib/logger'

const schema = z.object({
  appointmentId: z.string().uuid(),
  consultationMode: z.enum(['telehealth', 'face-to-face']),
  appointmentType: z.enum(['initial', 'follow-up']),
  serviceCategory: z.enum(['alternative-medicine', 'smoking-cessation']),
  scheduleTime: z.string(),
  patient: z.object({
    firstName: z.string().nullable(),
    lastName: z.string().min(1),
    dob: z.string(),
    gender: z.string(),
    email: z.string().optional().transform(v => v ?? ''),
    mobilePhone: z.string().optional().transform(v => v ?? ''),
  }),
})

export const POST = withACL(
  async (_, body: z.infer<typeof schema>) => {
    const intent = await createBookingPaymentIntent({
      appointmentId: body.appointmentId,
      consultationMode: body.consultationMode,
      appointmentType: body.appointmentType,
      serviceCategory: body.serviceCategory,
      scheduleTime: body.scheduleTime,
      patientFirstName: body.patient.firstName ?? '',
      patientLastName: body.patient.lastName,
      patientDob: body.patient.dob,
      patientGender: body.patient.gender,
      patientEmail: body.patient.email,
      patientMobile: body.patient.mobilePhone,
    })

    await logger.log({
      event: 'booking.payment_initiated',
      appointmentId: body.appointmentId,
      stripePaymentIntentId: intent.id,
      consultationMode: body.consultationMode,
      serviceCategory: body.serviceCategory,
      scheduleTime: body.scheduleTime,
    })

    return NextResponse.json({ clientSecret: intent.client_secret })
  },
  {
    schema,
    rateLimit: 'payment',
  },
)
