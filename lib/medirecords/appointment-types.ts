import { mrClient } from './client'
import type { MRAppointmentType, MRPage } from './types'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!
const BASE = process.env.MEDIRECORDS_APPOINTMENTS_URL

export async function getAppointmentTypes(opts?: {
  telehealth?: boolean
  activeStatus?: 1 | 2
}): Promise<MRAppointmentType[]> {
  const params = new URLSearchParams({ size: '100' })
  if (opts?.telehealth !== undefined) params.set('telehealth', String(opts.telehealth))
  if (opts?.activeStatus !== undefined) params.set('activeStatus', String(opts.activeStatus))

  const res = await mrClient.get<MRPage<MRAppointmentType>>(
    `/v1/practices/${PRACTICE_ID}/appointment-types?${params}`,
    { baseUrl: BASE },
  )
  return res.data ?? []
}
