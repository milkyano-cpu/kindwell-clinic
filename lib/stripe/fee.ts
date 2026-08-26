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

// Prices in AUD cents. intervalCode must match your MediRecords configuration.
// Set MEDIRECORDS_INTERVAL_CODE_5M, _10M, _20M in env after checking:
// GET /v1/code-system/appointment-interval-code
function intervalCode(key: '5M' | '10M' | '20M'): number {
  const val = process.env[`MEDIRECORDS_INTERVAL_CODE_${key}`]
  if (!val) throw new Error(`Missing env: MEDIRECORDS_INTERVAL_CODE_${key}`)
  return parseInt(val)
}

export function getFeeSchedule(
  mode: ConsultationMode,
  type: AppointmentType,
  service: ServiceCategory,
): FeeSchedule {
  const key = `${mode}:${type}:${service}`

  const TABLE: Record<string, Omit<FeeSchedule, 'intervalCode'> & { duration: '5M' | '10M' | '20M' }> = {
    'telehealth:initial:alternative-medicine':    { grossCents: 8900,  medicareRebateCents: null, outOfPocketCents: 8900, durationMinutes: 20, duration: '20M' },
    'telehealth:follow-up:alternative-medicine':  { grossCents: 5900,  medicareRebateCents: null, outOfPocketCents: 5900, durationMinutes: 10, duration: '10M' },
    'telehealth:initial:smoking-cessation':       { grossCents: 8900,  medicareRebateCents: null, outOfPocketCents: 8900, durationMinutes: 10, duration: '10M' },
    'telehealth:follow-up:smoking-cessation':     { grossCents: 5900,  medicareRebateCents: null, outOfPocketCents: 5900, durationMinutes: 5,  duration: '5M'  },
    'face-to-face:initial:alternative-medicine':  { grossCents: 10900, medicareRebateCents: 8710, outOfPocketCents: 2190, durationMinutes: 20, duration: '20M' },
    'face-to-face:follow-up:alternative-medicine':{ grossCents: 5900,  medicareRebateCents: 4390, outOfPocketCents: 1510, durationMinutes: 10, duration: '10M' },
    'face-to-face:initial:smoking-cessation':     { grossCents: 10900, medicareRebateCents: 8710, outOfPocketCents: 2190, durationMinutes: 10, duration: '10M' },
    'face-to-face:follow-up:smoking-cessation':   { grossCents: 5900,  medicareRebateCents: 4390, outOfPocketCents: 1510, durationMinutes: 5,  duration: '5M'  },
  }

  const row = TABLE[key]
  if (!row) throw new Error(`No fee schedule for: ${key}`)

  const { duration, ...rest } = row
  return { ...rest, intervalCode: intervalCode(duration) }
}
