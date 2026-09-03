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
