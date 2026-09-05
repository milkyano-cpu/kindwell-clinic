"use client";
import { useEffect, useMemo, useState } from "react";
import type { BookingData, ConsultationMode, ServiceType, StepId } from "@/lib/booking/types";
import { getSteps } from "@/lib/booking/steps-config";

const STORAGE_KEY = "kindwell-booking";

// Never restore into these steps — slot lock must always run fresh
const NO_RESTORE = new Set<StepId>(["confirmed"]);

const initialData: BookingData = {
  service: null, visitType: null, suitability: null, consultationMode: null, duration: null,
  providerId: null, providerName: null,
  slot: null, appointmentId: null, patient: null, referringGP: null, questionnaire: null,
};

interface Preset {
  service?: ServiceType;
  consultationMode?: ConsultationMode;
}

function readSession(): { data: BookingData; stepIndex: number } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useBookingFlow(preset?: Preset) {
  const [hydrated, setHydrated] = useState(false);

  // Always start from the default on both server and client (avoids hydration mismatch)
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

  // Restore saved session after hydration (safe — runs client-only)
  useEffect(() => {
    const saved = readSession();
    if (saved) {
      const savedSteps = getSteps(saved.data.visitType ?? "initial");
      const savedStep = savedSteps[saved.stepIndex];

      let targetIndex = saved.stepIndex;
      if (!savedStep || NO_RESTORE.has(savedStep)) {
        const confirmIdx = savedSteps.findIndex((s) => s === "confirm-payment");
        targetIndex = Math.max(0, confirmIdx > 0 ? confirmIdx - 1 : 0);
      }

      setData(saved.data);
      setStepIndex(targetIndex);
    }
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist on every change, clear when entering no-restore zone
  // hydrated omitted from deps intentionally — one-time guard, not a trigger
  useEffect(() => {
    if (!hydrated) return;
    if (NO_RESTORE.has(currentStep)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, stepIndex }));
    } catch {}
  }, [data, stepIndex, currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<BookingData>) => setData((prev) => ({ ...prev, ...patch }));
  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const goTo = (stepId: StepId) => {
    const idx = steps.indexOf(stepId);
    if (idx !== -1) setStepIndex(idx);
  };

  return { data, update, steps, stepIndex, currentStep, next, back, goTo, hydrated };
}
