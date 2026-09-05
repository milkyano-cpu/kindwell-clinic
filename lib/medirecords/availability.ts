import { getAppointments } from './appointments'
import { getProviderRegularSessions, sessionActiveOnDate, type MRRegularSession } from './sessions'

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

function generateSlots(date: string, durationMinutes: number, startHour = PRACTICE_START_HOUR, endHour = PRACTICE_END_HOUR): string[] {
  const slots: string[] = []
  let currentMinutes = startHour * 60
  const endMinutes = endHour * 60

  while (currentMinutes + durationMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    slots.push(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    currentMinutes += durationMinutes
  }
  return slots
}

function generateSlotsFromSessions(date: string, durationMinutes: number, sessions: MRRegularSession[]): string[] {
  const active = sessions.filter(s => sessionActiveOnDate(s, date))
  if (active.length === 0) return []

  const slotSet = new Set<string>()
  for (const s of active) {
    const [startH, startM] = s.startTime.split(':').map(Number)
    const [endH, endM] = s.endTime.split(':').map(Number)
    let cur = startH * 60 + startM
    const end = endH * 60 + endM
    while (cur + durationMinutes <= end) {
      const h = Math.floor(cur / 60)
      const m = cur % 60
      slotSet.add(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      cur += durationMinutes
    }
  }
  return Array.from(slotSet).sort()
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
}): Promise<{ time: string; available: boolean }[]> {
  const [booked, sessions] = await Promise.all([
    getAppointments({
      appointmentDateRangeStart: `${opts.date}T00:00`,
      appointmentDateRangeEnd: `${opts.date}T23:59`,
      providerId: opts.providerId,
    }),
    opts.providerId ? getProviderRegularSessions(opts.providerId).catch(() => null) : null,
  ])

  const bookedTimes = toBookedSet(booked)
  const practiceNow = getPracticeNow()
  const todayStr = practiceNow.slice(0, 10)

  const allSlots = sessions
    ? generateSlotsFromSessions(opts.date, opts.durationMinutes, sessions)
    : generateSlots(opts.date, opts.durationMinutes)

  return allSlots.map(slot => ({
    time: slot,
    available: !bookedTimes.has(slot) && !(opts.date === todayStr && slot <= practiceNow),
  }))
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

  const [booked, sessions] = await Promise.all([
    getAppointments({
      appointmentDateRangeStart: `${year}-${monthStr}-01T00:00`,
      appointmentDateRangeEnd: `${year}-${monthStr}-${pad2(daysInMonth)}T23:59`,
      providerId,
    }),
    providerId ? getProviderRegularSessions(providerId).catch(() => null) : null,
  ])

  const bookedTimes = toBookedSet(booked)
  const practiceNow = getPracticeNow()
  const todayStr = practiceNow.slice(0, 10)

  const availableDates: string[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${monthStr}-${pad2(day)}`
    if (dateStr < todayStr) continue

    const slots = sessions
      ? generateSlotsFromSessions(dateStr, durationMinutes, sessions)
      : generateSlots(dateStr, durationMinutes)

    const hasSlot = slots.some(s => {
      if (bookedTimes.has(s)) return false
      if (dateStr === todayStr && s <= practiceNow) return false
      return true
    })
    if (hasSlot) availableDates.push(dateStr)
  }

  return availableDates
}
