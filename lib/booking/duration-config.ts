import type { ConsultationMode, ServiceType, VisitType } from "./types";

// null = variable duration (picked by user later)
type DurationMap = Record<ServiceType, Record<VisitType, number | null>>;

const telehealthDurations: DurationMap = {
  "alternative-medicine": { initial: null, "follow-up": 10 },
  "smoking-cessation": { initial: null, "follow-up": null }, // TH not offered for smoking-ces
};

const f2fDurations: DurationMap = {
  "alternative-medicine": { initial: 20, "follow-up": 10 },
  "smoking-cessation": { initial: 15, "follow-up": 10 },
};

export function getDuration(
  service: ServiceType,
  visitType: VisitType,
  mode: ConsultationMode,
): number | null {
  return mode === "telehealth"
    ? telehealthDurations[service][visitType]
    : f2fDurations[service][visitType];
}

// For first-visit step badge — before mode is known, show null if variable by mode
export const firstVisitDurationHint: Record<ServiceType, Record<VisitType, number | null>> = {
  "alternative-medicine": { initial: 20, "follow-up": 10 },
  "smoking-cessation": { initial: 15, "follow-up": 10 },
};
