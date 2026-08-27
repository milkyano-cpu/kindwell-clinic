import type { StepId } from "@/lib/booking/types";

export function ProgressStepper({ steps, currentIndex }: { steps: StepId[]; currentIndex: number }) {
  return (
    <div className="bg-[#6E78FF] pb-5">
      <div className="container mx-auto max-w-lg px-4 flex gap-1.5">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}