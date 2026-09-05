import { mrClient } from './client'
import type { MRPatient, MRPatientCreate } from './types'

const IS_PROD = process.env.NODE_ENV === 'production'

export async function createPatient(data: MRPatientCreate): Promise<MRPatient> {
  const payload: MRPatientCreate = IS_PROD ? data : {
    ...data,
    firstName: data.firstName ? `_TEST_${data.firstName}` : null,
    lastName: `_TEST_${data.lastName}`,
  }
  return mrClient.post<MRPatient>('/v2/patients', payload)
}

export interface MRAddressCreate {
  addressType: number
  addressLine1: string
  addressLine2?: string | null
  addressLine3?: string | null
  cityCode: string
  postcode: string
  stateCode: string
  countryCode: string
}

export async function createPatientAddress(patientId: string, address: MRAddressCreate): Promise<void> {
  await mrClient.post(`/v1/patients/${patientId}/addresses`, address)
}

export interface MRRelationshipCreate {
  relationshipCode: number
  contactName: string
  contactMethod: number
  mobilePhone: string
  isEmergency: boolean
  isNOK: boolean
  isFamily: boolean
  isHeadOfFamily: boolean
}

export async function createPatientRelationship(patientId: string, relationship: MRRelationshipCreate): Promise<void> {
  await mrClient.post(`/v1/patients/${patientId}/relationships`, relationship)
}

export async function findPatientIdByEmail(email: string): Promise<string | null> {
  const results = await mrClient.get<{ id: string }[]>(
    `/v1/patients/exist?email=${encodeURIComponent(email)}`,
  )
  return results[0]?.id ?? null
}
