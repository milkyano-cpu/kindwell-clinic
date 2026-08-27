import { db } from '@/db'
import { bookingLogs } from '@/db/schema'

interface LogEntry {
  event: string
  appointmentId?: string
  stripePaymentIntentId?: string
  serviceCategory?: string
  consultationMode?: string
  scheduleTime?: string
  [key: string]: unknown
}

export const logger = {
  async log(entry: LogEntry): Promise<void> {
    const { event, appointmentId, stripePaymentIntentId, serviceCategory, consultationMode, scheduleTime, ...rest } = entry

    try {
      await db.insert(bookingLogs).values({
        event,
        appointmentId: appointmentId ?? null,
        stripePaymentIntentId: stripePaymentIntentId ?? null,
        serviceCategory: serviceCategory ?? null,
        consultationMode: consultationMode ?? null,
        scheduleTime: scheduleTime ?? null,
        metadata: Object.keys(rest).length ? JSON.stringify(rest) : null,
      })
    } catch (err) {
      // Logging must not break the booking flow
      console.error('[Logger] Failed to write log:', err)
    }
  },
}
