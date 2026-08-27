"use client";
import { Button } from "@/components/ui/button";
import type { ConsultationMode, StepProps } from "@/lib/booking/types";

const options: { value: ConsultationMode; label: string; desc: string }[] = [
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

export function ConsultationModeStep({ data, update, next }: StepProps) {
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
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update({ consultationMode: opt.value })}
            className="w-full flex items-center gap-4 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5"
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
            <span className="block text-sm text-muted-foreground">
              {opt.desc}
            </span>
          </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          disabled={!data.consultationMode}
          onClick={next}
          className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}