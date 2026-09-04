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
