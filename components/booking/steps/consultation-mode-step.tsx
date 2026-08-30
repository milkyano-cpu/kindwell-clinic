"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { ConsultationMode, StepProps } from "@/lib/booking/types";

const MODES: { value: ConsultationMode; label: string; desc: string }[] = [
  {
    value: "face-to-face",
    label: "Face to Face",
    desc: "Attend in clinic at your booked time. May attract a Medicare rebate.",
  },
  {
    value: "telehealth",
    label: "Telehealth",
    desc: "Your doctor calls you directly. Any script arrives by SMS or goes straight to your pharmacy.",
  },
];

const DURATIONS: { value: 10 | 15 | 20; label: string }[] = [
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 20, label: "20 minutes" },
];

export function ConsultationModeStep({ data, update, next, back }: StepProps) {
  const isSmokingCes = data.service === "smoking-cessation";
  const showDurationPicker =
    data.consultationMode === "telehealth" &&
    data.service === "alternative-medicine" &&
    data.visitType === "initial";

  // If user previously selected telehealth but switched service to smoking-ces, reset
  useEffect(() => {
    if (isSmokingCes && data.consultationMode === "telehealth") {
      update({ consultationMode: null, duration: null });
    }
  }, [isSmokingCes]);

  const handleModeSelect = (mode: ConsultationMode) => {
    update({ consultationMode: mode, duration: null });
  };

  const canContinue = !!data.consultationMode && (!showDurationPicker || data.duration !== null);

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <h1 className="whitespace-nowrap text-4xl font-bold text-[#6E78FF]">
          How would you like to be seen?
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose in person or telehealth, then pick a time.
      </p>

      <div className="space-y-4 text-left">
        {MODES.map((opt) => {
          const disabled = opt.value === "telehealth" && isSmokingCes;
          return (
            <button
              key={opt.value}
              disabled={disabled}
              onClick={() => handleModeSelect(opt.value)}
              className={`w-full flex items-center gap-4 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors ${
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-[#6E78FF]/5"
              }`}
            >
              <span
                className={`h-8 w-8 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${
                  data.consultationMode === opt.value ? "bg-[#6E78FF]" : "bg-white"
                }`}
              />
              <span className="flex-1 text-left">
                <span className="block whitespace-nowrap font-semibold text-[#6E78FF]">
                  {opt.label}
                </span>
                <span className="block text-sm text-muted-foreground">{opt.desc}</span>
                {disabled && (
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    Not available for Smoking Cessation
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {showDurationPicker && (
        <div className="space-y-3 text-left">
          <p className="text-sm font-semibold text-center">Select consultation duration</p>
          <div className="grid grid-cols-3 gap-3">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => update({ duration: d.value })}
                className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                  data.duration === d.value
                    ? "border-[#6E78FF] bg-[#6E78FF]/10 text-[#6E78FF]"
                    : "border-border hover:border-[#6E78FF]/50"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          disabled={!canContinue}
          onClick={next}
          className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          Continue
        </Button>
      </div>

      <button
        onClick={back}
        className="cursor-pointer text-xs font-semibold tracking-wide text-foreground underline underline-offset-4 transition-colors hover:text-[#6E78FF]"
      >
        BACK
      </button>
    </div>
  );
}
