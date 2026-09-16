import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withACL } from '@/lib/acl/with-acl'
import { createPatient, createPatientAddress, createPatientRelationship, findPatientIdByEmail, findPatientIdByMobile, normalizeMobile, deletePatient } from '@/lib/medirecords/patients'
import { MediRecordsError } from '@/lib/medirecords/client'
import { createAppointment, hasCompletedAppointment } from '@/lib/medirecords/appointments'
import { getFeeSchedule } from '@/lib/stripe/fee'
import { logger } from '@/lib/logger'
import { redis } from '@/lib/redis'

const IDEMPOTENCY_TTL = 900 // 15 min — matches slot lock window

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
  // Follow-up patients (already in MediRecords) only need email — all other fields optional
  patient: z.object({
    email: z.string().email().max(100).optional().or(z.literal('')),
    title: z.string().min(1).optional(),
    firstName: z.string().min(1).nullable().optional(),
    lastName: z.string().min(1).max(40).optional(),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.number().int().min(1).max(3).optional(),
    mobilePhone: z.string().regex(/^04\d{8}$/).optional(),
    address1: z.string().min(1).max(50).optional(),
    suburb: z.string().min(1).max(60).optional(),
    state: z.string().min(1).optional(),
    postcode: z.string().regex(/^\d{4}$/).optional(),
    emergencyContactName: z.string().min(1).optional(),
    emergencyContactPhone: z.string().min(1).optional(),
    emergencyRelationshipCode: z.number().int().min(1).optional(),
  }),
})

export const POST = withACL(
  async (req, body: z.infer<typeof schema>) => {
    const idempKey = req.headers.get('Idempotency-Key')

    if (idempKey && redis) {
      const cached = await redis.get<object>(`idempotency:booking:${idempKey}`)
      if (cached) return NextResponse.json(cached, { status: 201 })
    }

    const fee = getFeeSchedule(body.consultationMode, body.appointmentType, body.serviceCategory, body.duration)
    const appointmentTypeId = resolveAppointmentTypeId(body.consultationMode, body.appointmentType, body.serviceCategory, body.duration)

    const existingPatientId =
      (body.patient.mobilePhone
        ? await findPatientIdByMobile(body.patient.mobilePhone).catch(() => null)
        : null) ??
      (body.patient.email
        ? await findPatientIdByEmail(body.patient.email).catch(() => null)
        : null)

    const isReturning = existingPatientId
      ? await hasCompletedAppointment(existingPatientId, body.serviceCategory).catch(() => false)
      : false
    const expectedVisitType = isReturning ? 'follow-up' : 'initial'
    if (body.appointmentType !== expectedVisitType) {
      return NextResponse.json(
        {
          error: isReturning
            ? 'You have a previous completed visit. Please book as a follow-up.'
            : 'No previous completed visits found. Please book as an initial consultation.',
          type: 'visit_type_mismatch',
          expectedVisitType,
        },
        { status: 422 },
      )
    }

    let patientId: string

    if (existingPatientId) {
      patientId = existingPatientId
    } else {
      const p = body.patient
      if (!p.title || !p.lastName || !p.dob || p.gender == null ||
          !p.address1 || !p.suburb || !p.state || !p.postcode ||
          !p.emergencyContactName || !p.emergencyContactPhone || !p.emergencyRelationshipCode) {
        return NextResponse.json({ error: 'Patient details required for new patients.' }, { status: 400 })
      }
      const created = await createPatient({
        defaultPracticeId: PRACTICE_ID,
        usualDoctorId: body.providerId ?? null,
        titleCode: TITLE_CODES[p.title],
        firstName: p.firstName ?? null,
        lastName: p.lastName,
        gender: p.gender,
        dob: p.dob,
        patientStatusCode: 1,
        email: p.email || null,
        mobilePhone: p.mobilePhone ? normalizeMobile(p.mobilePhone) : null,
        contactMethod: 1,
      })
      patientId = created.id

      try {
        await createPatientAddress(patientId, {
          addressType: 1,
          addressLine1: p.address1,
          cityCode: p.suburb,
          postcode: p.postcode,
          stateCode: p.state,
          countryCode: 'AU',
        })
      } catch (err) {
        // Rollback: delete the just-created patient so there's no orphaned record
        await deletePatient(patientId).catch(() => null)

        if (err instanceof MediRecordsError) {
          const mrBody = err.body as { errors?: { parameter: string; message: string }[] }
          const addrErr = mrBody?.errors?.find((e) =>
            ['cityCode', 'stateCode', 'postcode'].includes(e.parameter)
          )
          if (addrErr) {
            return NextResponse.json(
              { error: addrErr.message, type: 'address_validation' },
              { status: 422 },
            )
          }
        }
        throw err
      }

      await createPatientRelationship(patientId, {
        relationshipCode: p.emergencyRelationshipCode,
        contactName: p.emergencyContactName,
        contactMethod: 3,
        mobilePhone: p.emergencyContactPhone,
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

    // Track slot lock so cron only deletes appointments created by this app
    if (redis) {
      await redis.zadd('slot-locks', { score: Date.now(), member: appointment.id })
    }

    // Return only what the client needs — no PII
    const result = {
      appointmentId: appointment.id,
      patientId,
      scheduleTime: appointment.scheduleTime,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }

    if (idempKey && redis) {
      await redis.set(`idempotency:booking:${idempKey}`, result, { ex: IDEMPOTENCY_TTL })
    }

    return NextResponse.json(result, { status: 201 })
  },
  {
    schema,
    rateLimit: 'booking',
  },
)
