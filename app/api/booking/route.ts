import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { createPatient } from '@/lib/medirecords/patients'
import { createAppointment } from '@/lib/medirecords/appointments'
import { getFeeSchedule } from '@/lib/stripe/fee'
import { logger } from '@/lib/logger'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!
const DEFAULT_PROVIDER_ID = process.env.MEDIRECORDS_PROVIDER_ID!

const schema = z.object({
  scheduleTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Format: YYYY-MM-DDTHH:mm'),
  appointmentTypeId: z.string().uuid(),
  consultationMode: z.enum(['telehealth', 'face-to-face']),
  appointmentType: z.enum(['initial', 'follow-up']),
  serviceCategory: z.enum(['alternative-medicine', 'smoking-cessation']),
  patient: z.object({
    firstName: z.string().min(1).nullable(),
    lastName: z.string().min(1),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: z.number().int().min(1).max(3),
    email: z.string().email().optional().or(z.literal('')),
    mobilePhone: z.string().optional(),
  }),
})

export const POST = withACL(
  async (_, body: z.infer<typeof schema>) => {
    const fee = getFeeSchedule(body.consultationMode, body.appointmentType, body.serviceCategory)

    // Create patient first — appointment requires patientId
    const patient = await createPatient({
      defaultPracticeId: PRACTICE_ID,
      usualDoctorId: DEFAULT_PROVIDER_ID,
      firstName: body.patient.firstName,
      lastName: body.patient.lastName,
      gender: body.patient.gender,
      dob: body.patient.dob,
      patientStatusCode: 1,
      email: body.patient.email || null,
      mobilePhone: body.patient.mobilePhone || null,
    })

    // Lock slot — status 2 (Booked), released on payment failure
    const appointment = await createAppointment({
      patientId: patient.id,
      appointmentTypeId: body.appointmentTypeId,
      scheduleTime: body.scheduleTime,
      appointmentStatus: 2,
      appointmentIntervalCode: fee.intervalCode,
      providerId: DEFAULT_PROVIDER_ID,
      emailReminder: true,
      reminderMethod: 1,
      reminderType: 7,
    })

    await logger.log({
      event: 'booking.slot_locked',
      appointmentId: appointment.id,
      scheduleTime: body.scheduleTime,
      consultationMode: body.consultationMode,
      serviceCategory: body.serviceCategory,
    })

    // Return only what the client needs — no PII
    return NextResponse.json(
      {
        appointmentId: appointment.id,
        patientId: patient.id,
        scheduleTime: appointment.scheduleTime,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
      { status: 201 },
    )
  },
  {
    schema,
    rateLimit: 'booking',
  },
)
