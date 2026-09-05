"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StepProps } from "@/lib/booking/types";

interface Provider {
  id: string;
  titleCode: string;
  firstName: string;
  lastName: string;
}

const TITLE_LABELS: Record<string, string> = {
  '315890000': 'Mr',
  '315890001': 'Mrs',
  '315890002': 'Ms',
  '315890003': 'Miss',
  '315890004': 'Dr',
  '315890005': 'Prof',
  '315890012': 'Mx',
}

function providerDisplayName(p: Provider): string {
  const title = TITLE_LABELS[p.titleCode] ?? ''
  return title ? `${title} ${p.firstName} ${p.lastName}` : `${p.firstName} ${p.lastName}`
}

const ANY_DOCTOR = "any";

export function ProviderStep({ data, update, next, back }: StepProps) {
  const isInitial = data.visitType === "initial";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(
    data.providerId ?? null,
  );

  const fetchProviders = () => {
    setLoading(true);
    setError(null);
    fetch("/api/providers")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setProviders(json.providers ?? []))
      .catch(() => setError("Couldn't load doctors. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProviders(); }, []);

  const canContinue = isInitial
    ? selected !== null // any selection (specific or ANY_DOCTOR)
    : selected !== null && selected !== ANY_DOCTOR; // must pick specific doctor

  const handleNext = () => {
    if (selected === ANY_DOCTOR) {
      update({ providerId: null, providerName: null });
    } else {
      const provider = providers.find((p) => p.id === selected);
      update({
        providerId: selected,
        providerName: provider ? providerDisplayName(provider) : null,
      });
    }
    next();
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">
          Choose your doctor.
        </h1>
        <p className="text-sm text-muted-foreground">
          {isInitial
            ? "Select a preferred doctor, or continue with no preference."
            : "Select the doctor you'd like to see."}
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground py-4">Loading doctors…</p>
      )}
      {error && (
        <div className="space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={fetchProviders}
            className="text-sm font-semibold text-[#6E78FF] underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3 text-left">
          {isInitial && (
            <button
              onClick={() => setSelected(ANY_DOCTOR)}
              className={`w-full flex items-center gap-4 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5`}
            >
              <span
                className={`h-8 w-8 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${
                  selected === ANY_DOCTOR ? "bg-[#6E78FF]" : "bg-white"
                }`}
              />
              <span className="flex-1 text-left">
                <span className="block font-semibold text-[#6E78FF]">No preferred doctor</span>
                <span className="block text-sm text-muted-foreground">
                  We'll assign the next available doctor
                </span>
              </span>
            </button>
          )}

          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="w-full flex items-center gap-4 rounded-xl border border-[#6E78FF] bg-white p-4 transition-colors hover:bg-[#6E78FF]/5"
            >
              <span
                className={`h-8 w-8 flex-shrink-0 rounded-full border-2 border-[#6E78FF] ${
                  selected === p.id ? "bg-[#6E78FF]" : "bg-white"
                }`}
              />
              <span className="flex-1 text-left">
                <span className="block font-semibold text-[#6E78FF]">
                  {providerDisplayName(p)}
                </span>
              </span>
            </button>
          ))}

          {providers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-2">
              No doctors available at the moment.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <Button
          disabled={!canContinue || loading || !!error}
          onClick={handleNext}
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
