export interface MRAppointmentType {
  id: string
  name: string
  duration: string
  colour: string
  order: number
  activeStatus: 1 | 2
  community: boolean
  telehealth: boolean
  description: string
}

export interface MRAppointment {
  id: string
  practiceId: string
  patientId: string
  appointmentTypeId: string
  scheduleTime: string
  appointmentStatus: number
  appointmentIntervalCode: number
  roomId: string | null
  referralId: string | null
  notes: string | null
  providerId: string | null
  walkIn: boolean | null
  firstAvailableDoctor: boolean | null
  urgency: number | null
  cancellationReason: number | null
  emailReminder: boolean
  reminderMethod: number | null
  reminderType: number | null
  confirmationLink: string | null
  telehealthLinkForProvider: string | null
  telehealthLinkForPatient: string | null
  createdBy: string
  createdDateTime: string
  updatedBy: string
  updatedDateTime: string
}

export interface MRAppointmentCreate {
  patientId: string
  appointmentTypeId: string
  scheduleTime: string
  appointmentStatus: number
  appointmentIntervalCode: number
  providerId?: string | null
  roomId?: string | null
  notes?: string | null
  walkIn?: boolean | null
  firstAvailableDoctor?: boolean | null
  allowDoubleBookingForPatient?: boolean | null
  allowDoubleBookingForProvider?: boolean | null
  urgency?: number | null
  emailReminder?: boolean | null
  reminderMethod?: number | null
  reminderType?: number | null
}

export interface MRPatientCreate {
  defaultPracticeId: string
  usualDoctorId?: string | null
  titleCode?: number | null
  firstName: string | null
  lastName: string
  gender: number
  dob: string
  patientStatusCode: number
  oneNameOnly?: boolean
  mobilePhone?: string | null
  homePhone?: string | null
  email?: string | null
  notes?: string | null
}

export interface MRPatient {
  id: string
  firstName: string | null
  lastName: string
  gender: number
  dob: string
  email: string | null
  mobilePhone: string | null
  defaultPracticeId: string
}

export interface MRPage<T> {
  data: T[]
  first: boolean
  last: boolean
  totalPages: number
  totalElements: number
  numberOfElements: number
  size: number
  page: number
}

export interface MRDeleteResponse {
  id: string
  message: string
}
