import type { ServiceType } from "./types";

interface TextField { id: string; label: string; placeholder?: string; required?: boolean }

export type SuitabilityRow =
  | { kind: "text"; field: TextField }
  | { kind: "text-pair"; title: string; fields: [TextField, TextField] }
  | { kind: "checkbox"; id: string; title: string; description: string; required?: boolean };

export const suitabilityConfig: Record<ServiceType, SuitabilityRow[]> = {
  "alternative-medicine": [
    { kind: "text", field: { id: "reason", label: "Reason for seeking help *", placeholder: "Briefly, what condition or symptoms would you like to discuss?", required: true } },
    { kind: "text", field: { id: "duration", label: "How long have you experienced this?", placeholder: "e.g. 6 months" } },
    { kind: "checkbox", id: "acknowledged", title: "Acknowledgement *", description: "I understand this consultation assesses my suitability for treatment and does not guarantee that any specific medication will be prescribed.", required: true },
  ],
  "smoking-cessation": [
    { kind: "text", field: { id: "reason", label: "Reason for seeking help *", placeholder: "Briefly, what condition or symptoms would you like to discuss?", required: true } },
    { kind: "text-pair", title: "Smoking history *", fields: [
      { id: "yearsSmoking", label: "Years smoking", placeholder: "e.g. 8", required: true },
      { id: "cigarettesPerDay", label: "Cigarettes per day", placeholder: "e.g. 15", required: true },
    ]},
    { kind: "text", field: { id: "quitAttempts", label: "Previous quit attempts / methods tried", placeholder: "e.g. patches, cold turkey" } },
    { kind: "checkbox", id: "acknowledged", title: "Acknowledgement *", description: "I understand this consultation assesses my suitability for treatment and does not guarantee that any specific medication will be prescribed.", required: true },
  ],
};