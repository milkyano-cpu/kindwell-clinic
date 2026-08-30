import { stripe } from './client'
import { getFeeSchedule, type ConsultationMode, type AppointmentType, type ServiceCategory } from './fee'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface BookingCheckoutParams {
  appointmentId: string
  consultationMode: ConsultationMode
  appointmentType: AppointmentType
  serviceCategory: ServiceCategory
  scheduleTime: string
}

export async function createBookingCheckoutSession(params: BookingCheckoutParams) {
  const fee = getFeeSchedule(params.consultationMode, params.appointmentType, params.serviceCategory)

  const modeLabel = params.consultationMode === 'telehealth' ? 'Telehealth' : 'In-person'
  const typeLabel = params.appointmentType === 'initial' ? 'Initial' : 'Follow-up'
  const serviceLabel =
    params.serviceCategory === 'alternative-medicine' ? 'Alternative Medicine' : 'Smoking Cessation'

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'aud',
          unit_amount: fee.outOfPocketCents,
          product_data: {
            name: `${serviceLabel} — ${typeLabel} (${modeLabel})`,
            description: `${fee.durationMinutes}-minute appointment on ${params.scheduleTime.slice(0, 10)}`,
          },
        },
      },
    ],
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
