"use client";
import { Button } from "@/components/ui/button";
import { suitabilityConfig } from "@/lib/booking/suitability-config";
import type { StepProps } from "@/lib/booking/types";

export function SuitabilityCheckStep({ data, update, next }: StepProps) {
  const answers = data.suitability ?? {};
  const rows = data.service ? suitabilityConfig[data.service] : [];

  const setValue = (id: string, value: string | boolean) =>
    update({ suitability: { ...answers, [id]: value } });

  const isComplete = rows.every((row) => {
    if (row.kind === "text") return !row.field.required || String(answers[row.field.id] ?? "").trim() !== "";
    if (row.kind === "text-pair") return row.fields.every((f) => !f.required || String(answers[f.id] ?? "").trim() !== "");
    return !row.required || answers[row.id] === true;
  });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">A quick suitability check.</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We ask this before booking so we only take a slot if this service is right for you.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-10 shadow-sm space-y-6">
        <div className="rounded-lg bg-[#6E78FF]/10 px-4 py-3 text-sm leading-relaxed">
          <span className="font-semibold text-[#6E78FF]">Pre-booking · Part 1.</span>{" "}
          <span className="text-foreground">This short assessment is completed before you choose a time and pay.</span>
        </div>

        {rows.map((row) => {
          if (row.kind === "text") {
            return (
              <div key={row.field.id} className="space-y-2">
                <label className="text-sm font-medium block">{row.field.label}</label>
                <input
                  value={String(answers[row.field.id] ?? "")}
                  onChange={(e) => setValue(row.field.id, e.target.value)}
                  placeholder={row.field.placeholder}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6E78FF]"
                />
              </div>
            );
          }
          if (row.kind === "text-pair") {
            return (
              <div key={row.title} className="space-y-2">
                <label className="text-sm font-medium block">{row.title}</label>
                <div className="grid grid-cols-2 gap-4">
                  {row.fields.map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <label className="text-sm font-medium block">{f.label}</label>
                      <input
                        value={String(answers[f.id] ?? "")}
                        onChange={(e) => setValue(f.id, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6E78FF]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={row.id} className="space-y-2">
              <label className="text-sm font-medium block">{row.title}</label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers[row.id] === true}
                  onChange={(e) => setValue(row.id, e.target.checked)}
                  className="mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 border-gray-300 text-[#6E78FF] focus:ring-[#6E78FF]"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">{row.description}</span>
              </label>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button disabled={!isComplete} onClick={next} className="w-full max-w-xs py-6 text-base bg-[#6E78FF] hover:bg-[#6E78FF]/90">
          Continue
        </Button>
      </div>
    </div>
  );
}