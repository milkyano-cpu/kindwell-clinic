export type ServiceType = "smoking-cessation" | "alternative-medicine";
export type VisitType = "initial" | "follow-up";
export type ConsultationMode = "telehealth" | "face-to-face";

export type StepId =
  | "service" | "first-visit" | "suitability"
  | "consultation-mode" | "provider" | "date-time"
  | "patient-details" | "referring-gp" | "questionnaire"
  | "confirm-payment" | "confirmed";

export type SuitabilityAnswers = Record<string, string | boolean>;

export interface ReferringGP {
  hasReferrer: boolean | null;
  name: string;
  email: string;
}

export interface BookingData {
  service: ServiceType | null;
  visitType: VisitType | null;
  suitability: SuitabilityAnswers | null;
  consultationMode: ConsultationMode | null;
  duration: 5 | 10 | 15 | 20 | null;
  providerId: string | null;
  providerName: string | null;
  slot: string | null; // "YYYY-MM-DDTHH:MM" — full ISO schedule time
  appointmentId: string | null;
  patient: PatientDetails | null;
  referringGP: ReferringGP | null;
  questionnaire: Record<string, string | boolean> | null;
}

export interface PatientDetails {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  address1: string;
  suburb: string;
  state: string;
  postcode: string;
  mobile: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  medicareNumber: string;
  ihiNumber: string;
}

export interface StepProps {
  data: BookingData;
  update: (patch: Partial<BookingData>) => void;
  next: () => void;
  back: () => void;
  goTo: (stepId: StepId) => void;
}