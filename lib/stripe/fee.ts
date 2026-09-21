import { getStripePrice } from './price-cache'

export type ConsultationMode = 'telehealth' | 'face-to-face'
export type AppointmentType = 'initial' | 'follow-up'
export type ServiceCategory = 'alternative-medicine' | 'smoking-cessation'

export interface FeeSchedule {
  durationMinutes: number
  intervalCode: number
}

const INTERVAL_CODES: Record<number, number> = { 5: 2, 10: 4, 15: 6, 20: 7 }

function intervalCode(minutes: number): number {
  const code = INTERVAL_CODES[minutes]
  if (!code) throw new Error(`No interval code for ${minutes} minutes`)
  return code
}

const DURATION_TABLE: Record<string, number> = {
  'telehealth:initial:alternative-medicine':     20,
  'telehealth:follow-up:alternative-medicine':   10,
  'face-to-face:initial:alternative-medicine':   20,
  'face-to-face:follow-up:alternative-medicine': 10,
  'face-to-face:initial:smoking-cessation':      15,
  'face-to-face:follow-up:smoking-cessation':    10,
}

export function resolvePriceId(
  mode: ConsultationMode,
  type: AppointmentType,
  service: ServiceCategory,
  durationMinutes?: number,
): string {
  const svc = service === 'alternative-medicine' ? 'ALT_MED' : 'SMOKING'
  const t = type === 'initial' ? 'INITIAL' : 'FOLLOWUP'
  const m = mode === 'telehealth' ? 'TELEHEALTH' : 'F2F'

  // Alt Med telehealth initial has 3 separate Stripe products per duration
  if (service === 'alternative-medicine' && mode === 'telehealth' && type === 'initial') {
    const dur = durationMinutes ?? DURATION_TABLE['telehealth:initial:alternative-medicine']
    const key = `STRIPE_PRICE_${svc}_${t}_${m}_${dur}`
    const val = process.env[key]
    if (!val) throw new Error(`Missing env: ${key}`)
    return val
  }

  const key = `STRIPE_PRICE_${svc}_${t}_${m}`
  const val = process.env[key]
  if (!val) throw new Error(`Missing env: ${key}`)
  return val
}

export function getFeeSchedule(
  mode: ConsultationMode,
  type: AppointmentType,
  service: ServiceCategory,
  durationOverride?: number,
): FeeSchedule {
  const key = `${mode}:${type}:${service}`
  const baseDuration = DURATION_TABLE[key]
  if (!baseDuration) throw new Error(`No duration for: ${key}`)
  const durationMinutes = durationOverride ?? baseDuration
  return { durationMinutes, intervalCode: intervalCode(durationMinutes) }
}

export async function getGrossCents(
  mode: ConsultationMode,
  type: AppointmentType,
  service: ServiceCategory,
  durationMinutes?: number,
): Promise<number> {
  const priceId = resolvePriceId(mode, type, service, durationMinutes)
  return getStripePrice(priceId)
}
