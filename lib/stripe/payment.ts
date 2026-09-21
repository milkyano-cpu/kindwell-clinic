import { stripe } from './client'
import { resolvePriceId, type ConsultationMode, type AppointmentType, type ServiceCategory } from './fee'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface BookingCheckoutParams {
  appointmentId: string
  consultationMode: ConsultationMode
  appointmentType: AppointmentType
  serviceCategory: ServiceCategory
  scheduleTime: string
  durationMinutes?: number
}

export async function createBookingCheckoutSession(params: BookingCheckoutParams) {
  const priceId = resolvePriceId(params.consultationMode, params.appointmentType, params.serviceCategory, params.durationMinutes)

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    // Expire after 30 min (Stripe's minimum allowed) — matches slot hold timer shown to user.
    // checkout.session.expired webhook fires at expiry and deletes the appointment,
    // so the cron never races against an active session.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    metadata: {
      appointmentId: params.appointmentId,
      consultationMode: params.consultationMode,
      serviceCategory: params.serviceCategory,
      scheduleTime: params.scheduleTime,
    },
    success_url: `${BASE_URL}/booking/confirmed?mode=${params.consultationMode}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/booking`,
  })
}
