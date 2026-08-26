import type Stripe from 'stripe'
import { stripe } from './client'
import { createPatient } from '@/lib/medirecords/patients'
import { updateAppointment, deleteAppointment } from '@/lib/medirecords/appointments'
import { logger } from '@/lib/logger'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!
const DEFAULT_PROVIDER_ID = process.env.MEDIRECORDS_PROVIDER_ID!

export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function handlePaymentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
  const meta = intent.metadata
  const { appointmentId } = meta

  const patient = await createPatient({
    defaultPracticeId: PRACTICE_ID,
    usualDoctorId: DEFAULT_PROVIDER_ID,
    firstName: meta.patientFirstName || null,
    lastName: meta.patientLastName,
    gender: parseInt(meta.patientGender),
    dob: meta.patientDob,
    patientStatusCode: 1,
    mobilePhone: meta.patientMobile || null,
    email: meta.patientEmail || null,
  })

  await updateAppointment(appointmentId, {
    patientId: patient.id,
    appointmentStatus: 3,
  })

  await logger.log({
    event: 'booking.confirmed',
    appointmentId,
    stripePaymentIntentId: intent.id,
    serviceCategory: meta.serviceCategory,
    consultationMode: meta.consultationMode,
    scheduleTime: meta.scheduleTime,
  })
}

export async function handlePaymentFailed(intent: Stripe.PaymentIntent): Promise<void> {
  const { appointmentId } = intent.metadata

  await deleteAppointment(appointmentId)

  await logger.log({
    event: 'booking.payment_failed',
    appointmentId,
    stripePaymentIntentId: intent.id,
  })
}
