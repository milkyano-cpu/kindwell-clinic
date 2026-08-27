"use client";
import { Button } from "@/components/ui/button";
import type { VisitType, StepProps } from "@/lib/booking/types";
import { durationConfig } from "@/lib/booking/duration-config";

const options: { value: VisitType; label: string; desc: string }[] = [
  { value: "initial", label: "Initial consultation", desc: "First time with us. A more detailed session." },
  { value: "follow-up", label: "Follow-up", desc: "You've seen us before. A quick check-in." },
];

export function FirstVisitStep({ data, update, next, back }: StepProps) {
  const durations = data.service ? durationConfig[data.service] : null;

  const handleSelect = (visitType: VisitType) => {
    update({
      visitType,
      duration: data.service ? durationConfig[data.service][visitType] : null,
    });
  };

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Is this your first visit?</h1>
      <p className="text-muted-foreground text-sm">This helps us set the right appointment length.</p>

      <div className="space-y-4 text-left">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="w-full flex items-center gap-3 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5"
          >
            <span
              className={`h-6 w-6 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${
                data.visitType === opt.value ? "bg-[#6E78FF]" : "bg-white"
              }`}
            />
            <span className="flex-1">
              <span className="block font-semibold text-[#6E78FF]">{opt.label}</span>
              <span className="block text-sm text-muted-foreground">{opt.desc}</span>
            </span>
            {durations && (
              <span className="flex-shrink-0 rounded-full bg-[#6E78FF]/10 px-3 py-1 text-sm font-medium text-[#6E78FF]">
                {durations[opt.value]} min
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          disabled={!data.visitType}
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