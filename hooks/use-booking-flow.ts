"use client";
import { useMemo, useState } from "react";
import type { BookingData, ConsultationMode, ServiceType, StepId } from "@/lib/booking/types";
import { getSteps } from "@/lib/booking/steps-config";

const initialData: BookingData = {
  service: null, visitType: null, suitability: null, consultationMode: null, duration: null,
  slot: null, patient: null, referringGP: null, questionnaire: null,
};

interface Preset {
  service?: ServiceType;
  consultationMode?: ConsultationMode;
}

export function useBookingFlow(preset?: Preset) {
  const [data, setData] = useState<BookingData>(() => ({
    ...initialData,
    ...(preset?.service ? { service: preset.service } : {}),
    ...(preset?.consultationMode ? { consultationMode: preset.consultationMode } : {}),
  }));

  const steps: StepId[] = useMemo(() => getSteps(data.visitType ?? "initial"), [data.visitType]);

  const [stepIndex, setStepIndex] = useState(() => {
    const skip = new Set<StepId>();
    if (preset?.service) skip.add("service");
    if (preset?.consultationMode) skip.add("consultation-mode");
    if (skip.size === 0) return 0;
    const idx = steps.findIndex((s) => !skip.has(s));
    return idx === -1 ? 0 : idx;
  });

  const currentStep = steps[stepIndex];

  const update = (patch: Partial<BookingData>) => setData((prev) => ({ ...prev, ...patch }));
  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  return { data, update, steps, stepIndex, currentStep, next, back };
}