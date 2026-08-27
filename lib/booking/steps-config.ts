import type { StepId, VisitType } from "./types";

export function getSteps(visitType: VisitType): StepId[] {
  const steps: StepId[] = ["service", "first-visit"];
  if (visitType === "initial") steps.push("suitability");
  steps.push("consultation-mode", "date-time", "patient-details", "referring-gp");
  if (visitType === "initial") steps.push("questionnaire");
  steps.push("confirm-payment", "confirmed");
  return steps;
}

export const CORE_STEPS: StepId[] = ["consultation-mode", "date-time", "confirm-payment"];