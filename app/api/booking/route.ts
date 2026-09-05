import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { createPatient, createPatientAddress, createPatientRelationship, findPatientIdByEmail } from '@/lib/medirecords/patients'
import { createAppointment } from '@/lib/medirecords/appointments'
import { getFeeSchedule } from '@/lib/stripe/fee'
import { logger } from '@/lib/logger'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!

// GET /v1/code-system/title-code
const TITLE_CODES: Record<string, number> = {
  Mr: 315890000,
  Mrs: 315890001,
  Ms: 315890002,
  Miss: 315890003,
  Dr: 315890004,
  Prof: 315890005,
  Mx: 315890012,
}

function resolveAppointmentTypeId(
  mode: 'telehealth' | 'face-to-face',
  appointmentType: 'initial' | 'follow-up',
  service: 'alternative-medicine' | 'smoking-cessation',
  duration?: number,
): string {
  let key: string

  if (appointmentType === 'follow-up') {
    const modeKey = mode === 'telehealth' ? 'TH' : 'F2F'
    const svcKey = service === 'alternative-medicine' ? 'ALT_MED' : 'SMK_CES'
    key = `MEDIRECORDS_APPT_TYPE_${svcKey}_${modeKey}_FU`
  } else {
    // initial
    if (mode === 'telehealth' && service === 'alternative-medicine') {
      // Variable duration: 10, 15, or 20 min
      const min = duration ?? 20
      key = `MEDIRECORDS_APPT_TYPE_ALT_MED_TH_${min}`
    } else if (mode === 'face-to-face' && service === 'alternative-medicine') {
      key = 'MEDIRECORDS_APPT_TYPE_ALT_MED_F2F'
    } else {
      // smoking-cessation initial (only F2F offered)
      key = 'MEDIRECORDS_APPT_TYPE_SMK_CES_F2F'
    }
  }

  const val = process.env[key]
  if (!val) throw new Error(`Missing env: ${key}`)
  return val
}

const schema = z.object({
  scheduleTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Format: YYYY-MM-DDTHH:mm'),
  consultationMode: z.enum(['telehealth', 'face-to-face']),
  appointmentType: z.enum(['initial', 'follow-up']),
  serviceCategory: z.enum(['alternative-medicine', 'smoking-cessation']),
  duration: z.number().int().optional(),
  providerId: z.string().uuid().optional(),
  notes: z.string().optional(),
  patient: z.object({
    title: z.string().min(1),
    firstName: z.string().min(1).nullable(),
    lastName: z.string().min(1),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: z.number().int().min(1).max(3),
    email: z.string().email().optional().or(z.literal('')),
    mobilePhone: z.string().optional(),
    address1: z.string().min(1),
    suburb: z.string().min(1),
    state: z.string().min(1),
    postcode: z.string().regex(/^\d{4}$/),
    emergencyContactName: z.string().min(1),
    emergencyContactPhone: z.string().min(1),
    emergencyRelationshipCode: z.number().int().min(1),
  }),
})

export const POST = withACL(
  async (_, body: z.infer<typeof schema>) => {
    const fee = getFeeSchedule(body.consultationMode, body.appointmentType, body.serviceCategory, body.duration)
    const appointmentTypeId = resolveAppointmentTypeId(body.consultationMode, body.appointmentType, body.serviceCategory, body.duration)

    const existingPatientId = body.patient.email
      ? await findPatientIdByEmail(body.patient.email).catch(() => null)
      : null

    let patientId: string

    if (existingPatientId) {
      patientId = existingPatientId
    } else {
      const patient = await createPatient({
        defaultPracticeId: PRACTICE_ID,
        usualDoctorId: body.providerId ?? null,
        titleCode: TITLE_CODES[body.patient.title],
        firstName: body.patient.firstName,
        lastName: body.patient.lastName,
        gender: body.patient.gender,
        dob: body.patient.dob,
        patientStatusCode: 1,
        email: body.patient.email || null,
        mobilePhone: body.patient.mobilePhone || null,
        contactMethod: 1,
      })
      patientId = patient.id

      await createPatientAddress(patientId, {
        addressType: 1,
        addressLine1: body.patient.address1,
        cityCode: body.patient.suburb,
        postcode: body.patient.postcode,
        stateCode: body.patient.state,
        countryCode: 'AU',
      })

      await createPatientRelationship(patientId, {
        relationshipCode: body.patient.emergencyRelationshipCode,
        contactName: body.patient.emergencyContactName,
        contactMethod: 3,
        mobilePhone: body.patient.emergencyContactPhone,
        isEmergency: true,
        isNOK: true,
        isFamily: false,
        isHeadOfFamily: false,
      })
    }

    const appointment = await createAppointment({
      patientId,
      appointmentTypeId,
      scheduleTime: body.scheduleTime,
      appointmentStatus: 2,
      appointmentIntervalCode: fee.intervalCode,
      providerId: body.providerId ?? null,
      notes: body.notes ?? null,
      allowDoubleBookingForPatient: false,
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
        patientId,
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
