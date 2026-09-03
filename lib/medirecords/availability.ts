import { getAppointments } from './appointments'

const PRACTICE_START_HOUR = parseInt(process.env.PRACTICE_START_HOUR ?? '8')
const PRACTICE_END_HOUR = parseInt(process.env.PRACTICE_END_HOUR ?? '18')
const PRACTICE_TIMEZONE = process.env.PRACTICE_TIMEZONE ?? 'Australia/Sydney'

// Returns "YYYY-MM-DDTHH:MM" in practice local time
function getPracticeNow(): string {
  return new Date()
    .toLocaleString('sv-SE', { timeZone: PRACTICE_TIMEZONE })
    .replace(' ', 'T')
    .slice(0, 16)
}

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

function toBookedSet(appointments: Awaited<ReturnType<typeof getAppointments>>): Set<string> {
  return new Set(
    appointments
      .filter(a => a.appointmentStatus !== 8)
      .map(a => a.scheduleTime.slice(0, 16)),
  )
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
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
  })

  const bookedTimes = toBookedSet(booked)
  const practiceNow = getPracticeNow()
  const todayStr = practiceNow.slice(0, 10)

  return generateSlots(opts.date, opts.durationMinutes).filter(slot => {
    if (bookedTimes.has(slot)) return false
    if (opts.date === todayStr && slot <= practiceNow) return false
    return true
  })
}

export async function getAvailableDatesForMonth(opts: {
  year: number
  month: number
  durationMinutes: number
  providerId?: string
}): Promise<string[]> {
  const { year, month, durationMinutes, providerId } = opts
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthStr = pad2(month)

  const booked = await getAppointments({
    appointmentDateRangeStart: `${year}-${monthStr}-01T00:00`,
    appointmentDateRangeEnd: `${year}-${monthStr}-${pad2(daysInMonth)}T23:59`,
    providerId,
  })

  const bookedTimes = toBookedSet(booked)

  const practiceNow = getPracticeNow()
  const todayStr = practiceNow.slice(0, 10)

  const availableDates: string[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${monthStr}-${pad2(day)}`
    if (dateStr < todayStr) continue

    const hasSlot = generateSlots(dateStr, durationMinutes).some(s => {
      if (bookedTimes.has(s)) return false
      if (dateStr === todayStr && s <= practiceNow) return false
      return true
    })
    if (hasSlot) availableDates.push(dateStr)
  }

  return availableDates
}
