"use client";
import { Button } from "@/components/ui/button";
import type { ReferringGP, StepProps } from "@/lib/booking/types";

const emptyGP: ReferringGP = { hasReferrer: null, name: "", email: "" };

export function ReferringGPStep({ data, update, next, back }: StepProps) {
  const gp = data.referringGP ?? emptyGP;
  const setField = (patch: Partial<ReferringGP>) => update({ referringGP: { ...gp, ...patch } });

  const isComplete =
    gp.hasReferrer === false ||
    (gp.hasReferrer === true && gp.name.trim() !== "" && gp.email.trim() !== "");

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <h1 className="whitespace-nowrap text-4xl font-bold text-[#6E78FF]">
          Were you referred by a GP or clinic?
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        If yes, we'll keep them in the loop on your care.
      </p>

      <div className="space-y-4 text-left">
        <button
          onClick={() => setField({ hasReferrer: true })}
          className="w-full flex items-center gap-4 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5"
        >
          <span className={`h-6 w-6 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${gp.hasReferrer === true ? "bg-[#6E78FF]" : "bg-white"}`} />
          <span className="text-left">
            <span className="block font-semibold text-[#6E78FF]">
              Yes, I have a referrer
            </span>
            <span className="block text-sm text-muted-foreground">
              We'll send your clinical notes / script to them.
            </span>
          </span>
        </button>

        {gp.hasReferrer === true && (
          <div className="rounded-2xl bg-white p-8 shadow-sm space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Referring GP / clinic name *</label>
              <input
                value={gp.name}
                onChange={(e) => setField({ name: e.target.value })}
                placeholder="e.g. Dr Sarah Lee — Fitzroy Family Practice"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6E78FF]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Referring email address *</label>
              <input
                value={gp.email}
                onChange={(e) => setField({ email: e.target.value })}
                placeholder="clinic@example.com.au"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6E78FF]"
              />
              <p className="text-xs text-muted-foreground">Used to auto-forward notes and script QR codes.</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setField({ hasReferrer: false })}
          className="w-full flex items-center gap-4 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5"
        >
          <span className={`h-6 w-6 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${gp.hasReferrer === false ? "bg-[#6E78FF]" : "bg-white"}`} />
          <span className="text-left">
            <span className="block font-semibold text-[#6E78FF]">
              I don't have a referrer
            </span>
            <span className="block text-sm text-muted-foreground">
              That's fine — you can still book.
            </span>
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          disabled={!isComplete}
          onClick={next}
          className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          Continue
        </Button>
        <button
          onClick={back}
          className="cursor-pointer text-xs font-semibold tracking-wide text-foreground underline underline-offset-4 transition-colors hover:text-[#6E78FF]"
        >
          BACK
        </button>
      </div>
    </div>
  );
}