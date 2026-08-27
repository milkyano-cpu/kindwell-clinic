import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const bookingLogs = pgTable('booking_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  event: text('event').notNull(),
  appointmentId: text('appointment_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  serviceCategory: text('service_category'),
  consultationMode: text('consultation_mode'),
  scheduleTime: text('schedule_time'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
