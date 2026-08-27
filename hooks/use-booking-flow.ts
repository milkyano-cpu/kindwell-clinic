"use client";
import { useMemo, useState } from "react";
import type { BookingData, StepId } from "@/lib/booking/types";
import { getSteps } from "@/lib/booking/steps-config";

const initialData: BookingData = {
  service: null, visitType: null, suitability: null, consultationMode: null, duration: null,
  slot: null, patient: null, referringGP: null, questionnaire: null,
};

export function useBookingFlow() {
  const [data, setData] = useState<BookingData>(initialData);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: StepId[] = useMemo(() => getSteps(data.visitType ?? "initial"), [data.visitType]);
  const currentStep = steps[stepIndex];

  const update = (patch: Partial<BookingData>) => setData((prev) => ({ ...prev, ...patch }));
  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  return { data, update, steps, stepIndex, currentStep, next, back };
}