import { stripe } from './client'
import { getFeeSchedule, type ConsultationMode, type AppointmentType, type ServiceCategory } from './fee'

export interface BookingPaymentParams {
  appointmentId: string
  consultationMode: ConsultationMode
  appointmentType: AppointmentType
  serviceCategory: ServiceCategory
  scheduleTime: string
  patientFirstName: string
  patientLastName: string
  patientDob: string
  patientGender: string
  patientEmail: string
  patientMobile: string
}

export async function createBookingPaymentIntent(params: BookingPaymentParams) {
  const fee = getFeeSchedule(params.consultationMode, params.appointmentType, params.serviceCategory)

  return stripe.paymentIntents.create({
    amount: fee.grossCents,
    currency: 'aud',
    automatic_payment_methods: { enabled: true },
    metadata: {
      appointmentId: params.appointmentId,
      consultationMode: params.consultationMode,
      appointmentType: params.appointmentType,
      serviceCategory: params.serviceCategory,
      scheduleTime: params.scheduleTime,
      patientFirstName: params.patientFirstName,
      patientLastName: params.patientLastName,
      patientDob: params.patientDob,
      patientGender: params.patientGender,
      patientEmail: params.patientEmail,
      patientMobile: params.patientMobile,
    },
  })
}
