"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StepProps } from "@/lib/booking/types";
import { pricingConfig, serviceLabel, visitTypeLabel, modeLabel, formatCurrency } from "@/lib/booking/pricing-config";

// TODO: sinkronin sama expiry beneran dari Medirecords 15-min slot lock (Step 5, CORE)
function useSlotExpiry() {
  const [seconds, setSeconds] = useState(15 * 60);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return { seconds, expired: seconds === 0 };
}

export function ConfirmPaymentStep({ data, back, next }: StepProps) {
  const { seconds, expired } = useSlotExpiry();

  if (!data.service || !data.visitType || !data.consultationMode) {
    return null; // guard: gak lengkap datanya, harusnya gak kejadian kalau flow diikutin urut
  }

  const fee = pricingConfig[data.consultationMode][data.service][data.visitType];
  const duration = data.duration ?? 0;

  const handlePayment = () => {
    // TODO: ganti placeholder ini dengan real Stripe redirect — Step 9 CORE
    // const res = await fetch("/api/booking/create-checkout-session", {
    //   method: "POST",
    //   body: JSON.stringify({ ...data, amount: fee.net }),
    // });
    // const { url } = await res.json();
    // window.location.href = url; // ← browser pindah ke halaman Stripe Checkout
    // Setelah bayar sukses, Stripe redirect balik + webhook `payment_intent.succeeded`
    // yang beneran mindahin user ke step "confirmed" — bukan langsung dari klik tombol ini.

    // SEMENTARA: langsung ke ConfirmedStep biar flow bisa dites end-to-end
    next();
  };

  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Confirm and pay.</h1>
        <p className="text-sm text-muted-foreground">Here's your fee breakdown, including any Medicare rebate.</p>
        {expired ? (
          <p className="inline-block rounded-full bg-orange-50 px-6 py-3 text-lg font-medium text-orange-600">
            Slot released. Please pick a new time.
          </p>
        ) : (
          <p className="inline-block rounded-full bg-orange-50 px-6 py-3 text-lg font-medium text-orange-600">
            Slot held — {m}:{s} left
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm text-left space-y-1">
        <p className="text-lg font-bold text-[#6E78FF] mb-4">Order summary</p>

        <div className="flex justify-between py-2.5 border-b text-sm">
          <span>{serviceLabel[data.service]} · {visitTypeLabel[data.visitType]} ({duration} min)</span>
          <span className="font-medium">{formatCurrency(fee.gross)}</span>
        </div>

        <div className="flex justify-between py-2.5 border-b text-sm">
          <span>{modeLabel[data.consultationMode]}</span>
          <span className="text-muted-foreground">—</span>
        </div>

        <div className="flex justify-between py-2.5 border-b text-sm">
          <span>Medicare rebate</span>
          <span className={fee.rebate > 0 ? "text-green-600" : "text-muted-foreground"}>
            {fee.rebate > 0 ? `− ${formatCurrency(fee.rebate)}` : "N/A"}
          </span>
        </div>

        <div className="flex justify-between pt-3 font-bold">
          <span>Total due today</span>
          <span>{formatCurrency(fee.net)}</span>
        </div>

        <Button
          disabled={expired}
          onClick={handlePayment}
          className="w-full mt-4 py-6 text-base bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          {expired ? "Slot expired" : `Confirm & Pay ${formatCurrency(fee.net)}`}
        </Button>

        <div className="pt-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            🔒 Secure payment by
          </p>
          <p className="text-2xl font-bold text-[#6E78FF] mt-1">stripe</p>
        </div>
      </div>

      {expired && (
        <button onClick={back} className="text-sm font-medium text-[#6E78FF] underline underline-offset-4">
          Back to pick a new time
        </button>
      )}
    </div>
  );
}