import type { ConsultationMode, ServiceType, VisitType } from "./types";

interface FeeEntry { durationMinutes: number }

export const pricingConfig: Record<ConsultationMode, Record<ServiceType, Record<VisitType, FeeEntry>>> = {
  telehealth: {
    "alternative-medicine": {
      initial:     { durationMinutes: 20 },
      "follow-up": { durationMinutes: 10 },
    },
    "smoking-cessation": {
      initial:     { durationMinutes: 15 },
      "follow-up": { durationMinutes: 10 },
    },
  },
  "face-to-face": {
    "alternative-medicine": {
      initial:     { durationMinutes: 20 },
      "follow-up": { durationMinutes: 10 },
    },
    "smoking-cessation": {
      initial:     { durationMinutes: 15 },
      "follow-up": { durationMinutes: 10 },
    },
  },
};

export const serviceLabel: Record<ServiceType, string> = {
  "alternative-medicine": "Alternative Medicine",
  "smoking-cessation": "Smoking Cessation",
};

export const visitTypeLabel: Record<VisitType, string> = {
  initial: "Initial",
  "follow-up": "Follow-up",
};

export const modeLabel: Record<ConsultationMode, string> = {
  telehealth: "Telehealth",
  "face-to-face": "In person",
};

export function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
