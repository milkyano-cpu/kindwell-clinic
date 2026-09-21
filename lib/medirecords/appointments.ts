import { mrClient } from './client'
import type { MRAppointment, MRAppointmentCreate, MRDeleteResponse, MRPage } from './types'

const PRACTICE_ID = process.env.MEDIRECORDS_PRACTICE_ID!

export async function getAppointments(opts: {
  appointmentDateRangeStart: string
  appointmentDateRangeEnd: string
  providerId?: string
  appointmentTypeId?: string
  appointmentStatus?: number
}): Promise<MRAppointment[]> {
  const params = new URLSearchParams({
    appointmentDateRangeStart: opts.appointmentDateRangeStart,
    appointmentDateRangeEnd: opts.appointmentDateRangeEnd,
    size: '200',
  })
  if (opts.providerId) params.set('providerId', opts.providerId)
  if (opts.appointmentTypeId) params.set('appointmentTypeId', opts.appointmentTypeId)
  if (opts.appointmentStatus !== undefined) params.set('appointmentStatus', String(opts.appointmentStatus))

  const res = await mrClient.get<MRPage<MRAppointment>>(
    `/v1/practices/${PRACTICE_ID}/appointments?${params}`,
  )
  return res.data ?? []
}

export async function createAppointment(data: MRAppointmentCreate): Promise<MRAppointment> {
  return mrClient.post<MRAppointment>(`/v1/practices/${PRACTICE_ID}/appointments`, data)
}

export async function getAppointmentById(appointmentId: string): Promise<MRAppointment> {
  return mrClient.get<MRAppointment>(
    `/v1/practices/${PRACTICE_ID}/appointments/${appointmentId}`,
  )
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<MRAppointmentCreate>,
): Promise<MRAppointment> {
  return mrClient.put<MRAppointment>(
    `/v1/practices/${PRACTICE_ID}/appointments/${appointmentId}`,
    data,
  )
}

export async function deleteAppointment(appointmentId: string): Promise<MRDeleteResponse> {
  return mrClient.delete<MRDeleteResponse>(
    `/v1/practices/${PRACTICE_ID}/appointments/${appointmentId}`,
  )
}

function getAppointmentTypeIdsForService(service: 'alternative-medicine' | 'smoking-cessation'): Set<string> {
  const keys = service === 'alternative-medicine'
    ? [
        'MEDIRECORDS_APPT_TYPE_ALT_MED_TH_10',
        'MEDIRECORDS_APPT_TYPE_ALT_MED_TH_15',
        'MEDIRECORDS_APPT_TYPE_ALT_MED_TH_20',
        'MEDIRECORDS_APPT_TYPE_ALT_MED_F2F',
        'MEDIRECORDS_APPT_TYPE_ALT_MED_TH_FU',
        'MEDIRECORDS_APPT_TYPE_ALT_MED_F2F_FU',
      ]
    : [
        'MEDIRECORDS_APPT_TYPE_SMK_CES_F2F',
        'MEDIRECORDS_APPT_TYPE_SMK_CES_F2F_FU',
      ]
  return new Set(keys.map(k => process.env[k]).filter(Boolean) as string[])
}

export async function hasCompletedAppointment(
  patientId: string,
  service: 'alternative-medicine' | 'smoking-cessation',
): Promise<boolean> {
  const typeIds = getAppointmentTypeIdsForService(service)
  const res = await mrClient.get<MRPage<MRAppointment>>(
    `/v1/practices/${PRACTICE_ID}/appointments?patientId=${encodeURIComponent(patientId)}&appointmentStatus=7&size=200`,
  )
  return (res.data ?? []).some(appt => typeIds.has(appt.appointmentTypeId))
}
