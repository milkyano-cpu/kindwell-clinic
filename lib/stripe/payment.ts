import { stripe } from './client'
import type { ConsultationMode, AppointmentType, ServiceCategory } from './fee'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function resolvePriceId(
  mode: ConsultationMode,
  type: AppointmentType,
  service: ServiceCategory,
): string {
  const svc = service === 'alternative-medicine' ? 'ALT_MED' : 'SMOKING'
  const t = type === 'initial' ? 'INITIAL' : 'FOLLOWUP'
  const m = mode === 'telehealth' ? 'TELEHEALTH' : 'F2F'
  const key = `STRIPE_PRICE_${svc}_${t}_${m}`
  const val = process.env[key]
  if (!val) throw new Error(`Missing env: ${key}`)
  return val
}

export interface BookingCheckoutParams {
  appointmentId: string
  consultationMode: ConsultationMode
  appointmentType: AppointmentType
  serviceCategory: ServiceCategory
  scheduleTime: string
}

export async function createBookingCheckoutSession(params: BookingCheckoutParams) {
  const priceId = resolvePriceId(params.consultationMode, params.appointmentType, params.serviceCategory)

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
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
