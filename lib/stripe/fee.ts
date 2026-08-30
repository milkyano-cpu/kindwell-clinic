export type ConsultationMode = 'telehealth' | 'face-to-face'
export type AppointmentType = 'initial' | 'follow-up'
export type ServiceCategory = 'alternative-medicine' | 'smoking-cessation'

export interface FeeSchedule {
  grossCents: number
  medicareRebateCents: number | null
  outOfPocketCents: number
  durationMinutes: number
  intervalCode: number
}

// Global MediRecords interval codes — from GET /v1/code-system/appointment-interval-code
const INTERVAL_CODES: Record<number, number> = { 5: 2, 10: 4, 15: 6, 20: 7 }

function intervalCode(minutes: number): number {
  const code = INTERVAL_CODES[minutes]
  if (!code) throw new Error(`No interval code for ${minutes} minutes`)
  return code
}

type FeeRow = { grossCents: number; medicareRebateCents: number | null; outOfPocketCents: number; durationMinutes: number }

const TABLE: Record<string, FeeRow> = {
  'telehealth:initial:alternative-medicine':     { grossCents: 8900,  medicareRebateCents: null, outOfPocketCents: 8900, durationMinutes: 20 },
  'telehealth:follow-up:alternative-medicine':   { grossCents: 5900,  medicareRebateCents: null, outOfPocketCents: 5900, durationMinutes: 10 },
  'telehealth:initial:smoking-cessation':        { grossCents: 8900,  medicareRebateCents: null, outOfPocketCents: 8900, durationMinutes: 10 },
  'telehealth:follow-up:smoking-cessation':      { grossCents: 5900,  medicareRebateCents: null, outOfPocketCents: 5900, durationMinutes: 5  },
  'face-to-face:initial:alternative-medicine':   { grossCents: 10900, medicareRebateCents: 8710, outOfPocketCents: 2190, durationMinutes: 20 },
  'face-to-face:follow-up:alternative-medicine': { grossCents: 5900,  medicareRebateCents: 4390, outOfPocketCents: 1510, durationMinutes: 10 },
  'face-to-face:initial:smoking-cessation':      { grossCents: 10900, medicareRebateCents: 8710, outOfPocketCents: 2190, durationMinutes: 15 },
  'face-to-face:follow-up:smoking-cessation':    { grossCents: 5900,  medicareRebateCents: 4390, outOfPocketCents: 1510, durationMinutes: 5  },
}

export function getFeeSchedule(
  mode: ConsultationMode,
  type: AppointmentType,
  service: ServiceCategory,
  durationOverride?: number,
): FeeSchedule {
  const key = `${mode}:${type}:${service}`
  const row = TABLE[key]
  if (!row) throw new Error(`No fee schedule for: ${key}`)

  const durationMinutes = durationOverride ?? row.durationMinutes
  return { ...row, durationMinutes, intervalCode: intervalCode(durationMinutes) }
}
