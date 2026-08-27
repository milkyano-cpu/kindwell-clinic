import { mrClient } from './client'
import type { MRPatient, MRPatientCreate } from './types'

const TEST_PREFIX = process.env.MEDIRECORDS_TEST_PREFIX ?? ''
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export async function createPatient(data: MRPatientCreate): Promise<MRPatient> {
  const payload: MRPatientCreate = {
    ...data,
    // Prefix names in non-production to avoid polluting real patient records
    firstName: !IS_PRODUCTION && data.firstName ? `${TEST_PREFIX}${data.firstName}` : data.firstName,
    lastName: !IS_PRODUCTION ? `${TEST_PREFIX}${data.lastName}` : data.lastName,
  }

  return mrClient.post<MRPatient>('/v2/patients', payload)
}
