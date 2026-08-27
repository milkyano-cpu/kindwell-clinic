"use client";
import { Button } from "@/components/ui/button";
import type { ServiceType, StepProps } from "@/lib/booking/types";

const services: { value: ServiceType; label: string; description: string }[] = [
  {
    value: "alternative-medicine",
    label: "Alternative Medicine",
    description: "Consult a practitioner about alternative treatment options.",
  },
  {
    value: "smoking-cessation",
    label: "Smoking Cessation",
    description: "Get support to quit, including nicotine replacement guidance.",
  },
];

export function ServiceStep({ data, update, next }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <h1 className="whitespace-nowrap text-4xl font-bold text-[#6E78FF]">
          What can we help you with today?
        </h1>
      </div>

      <p className="text-center text-muted-foreground text-sm">
        Choose the service you'd like to book.
      </p>

      <div className="space-y-4 text-left">
        {services.map((s) => (
          <button
            key={s.value}
            onClick={() => update({ service: s.value })}
            className="w-full flex items-start gap-3 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5"
          >
            <span
              className={`mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${
                data.service === s.value ? "bg-[#6E78FF]" : "bg-white"
              }`}
            />
            <span>
              <span className="block font-semibold text-[#6E78FF]">{s.label}</span>
              <span className="block text-sm text-muted-foreground">{s.description}</span>
            </span>
          </button>
        ))}
      </div>

    <div className="flex justify-center">
      <Button
        disabled={!data.service}
        onClick={next}
        className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
      >
        Continue
      </Button>
    </div>
    </div>
  );
}