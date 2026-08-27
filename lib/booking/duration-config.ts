import type { ServiceType, VisitType } from "./types";

export const durationConfig: Record<ServiceType, Record<VisitType, 5 | 10 | 20>> = {
  "alternative-medicine": { initial: 20, "follow-up": 10 },
  "smoking-cessation": { initial: 10, "follow-up": 5 },
};