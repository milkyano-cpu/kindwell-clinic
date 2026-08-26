import { getAppointments } from './appointments'

const PRACTICE_START_HOUR = parseInt(process.env.PRACTICE_START_HOUR ?? '8')
const PRACTICE_END_HOUR = parseInt(process.env.PRACTICE_END_HOUR ?? '18')

function generateSlots(date: string, durationMinutes: number): string[] {
  const slots: string[] = []
  let currentMinutes = PRACTICE_START_HOUR * 60
  const endMinutes = PRACTICE_END_HOUR * 60

  while (currentMinutes + durationMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    slots.push(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    currentMinutes += durationMinutes
  }
  return slots
}

export async function getAvailableSlots(opts: {
  date: string
  durationMinutes: number
  providerId?: string
}): Promise<string[]> {
  const booked = await getAppointments({
    appointmentDateRangeStart: `${opts.date}T00:00`,
    appointmentDateRangeEnd: `${opts.date}T23:59`,
    providerId: opts.providerId,
    // Include booked (2) and confirmed (3) appointments as taken
  })

  // Treat any non-canceled appointment as occupying that slot
  const bookedTimes = new Set(
    booked
      .filter(a => a.appointmentStatus !== 8) // 8 = Cancelled
      .map(a => a.scheduleTime.slice(0, 16)),
  )

  return generateSlots(opts.date, opts.durationMinutes).filter(
    slot => !bookedTimes.has(slot),
  )
}
