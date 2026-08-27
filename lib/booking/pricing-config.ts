import type { ConsultationMode, ServiceType, VisitType } from "./types";

interface FeeEntry { gross: number; rebate: number; net: number }

export const pricingConfig: Record<ConsultationMode, Record<ServiceType, Record<VisitType, FeeEntry>>> = {
  telehealth: {
    "alternative-medicine": {
      initial: { gross: 89, rebate: 0, net: 89 },
      "follow-up": { gross: 59, rebate: 0, net: 59 },
    },
    "smoking-cessation": {
      initial: { gross: 89, rebate: 0, net: 89 },
      "follow-up": { gross: 59, rebate: 0, net: 59 },
    },
  },
  "face-to-face": {
    "alternative-medicine": {
      initial: { gross: 109, rebate: 87.1, net: 21.9 },
      "follow-up": { gross: 59, rebate: 43.9, net: 15.1 },
    },
    "smoking-cessation": {
      initial: { gross: 109, rebate: 87.1, net: 21.9 },
      "follow-up": { gross: 59, rebate: 43.9, net: 15.1 },
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

export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}