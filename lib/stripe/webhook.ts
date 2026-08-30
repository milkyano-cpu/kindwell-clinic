import type Stripe from 'stripe'
import { stripe } from './client'
import { updateAppointment, deleteAppointment } from '@/lib/medirecords/appointments'
import { logger } from '@/lib/logger'

export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== 'paid') return

  const { appointmentId, serviceCategory, consultationMode, scheduleTime } = session.metadata ?? {}
  if (!appointmentId) return

  await updateAppointment(appointmentId, { appointmentStatus: 3 })

  await logger.log({
    event: 'booking.confirmed',
    appointmentId,
    stripePaymentIntentId: (session.payment_intent as string) ?? session.id,
    serviceCategory: serviceCategory ?? '',
    consultationMode: consultationMode ?? '',
    scheduleTime: scheduleTime ?? '',
  })
}

export async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  const { appointmentId } = session.metadata ?? {}
  if (!appointmentId) return

  await deleteAppointment(appointmentId)

  await logger.log({
    event: 'booking.payment_failed',
    appointmentId,
    stripePaymentIntentId: (session.payment_intent as string) ?? session.id,
  })
}
