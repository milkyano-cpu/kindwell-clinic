import type { StepId, VisitType } from "./types";

export function getSteps(visitType: VisitType): StepId[] {
  const steps: StepId[] = ["service", "first-visit"];
  // if (visitType === "initial") steps.push("suitability");
  steps.push("consultation-mode", "provider", "date-time", "patient-details");
  // steps.push("referring-gp"); // pending: MediRecords referral API requires internal UUIDs — handled manually by clinic
  // if (visitType === "initial") steps.push("questionnaire"); // pending: no write endpoint for FHIR consent — handled manually by clinic
  steps.push("confirm-payment", "confirmed");
  return steps;
}

export const CORE_STEPS: StepId[] = ["consultation-mode", "date-time", "confirm-payment"];