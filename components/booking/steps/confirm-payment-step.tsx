"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StepProps } from "@/lib/booking/types";
import { pricingConfig, serviceLabel, visitTypeLabel, modeLabel, formatCurrency } from "@/lib/booking/pricing-config";
import { RELATIONSHIP_CODE_BY_LABEL } from "@/lib/booking/relationships";

function mapGender(gender: string): number {
  if (gender === "Female") return 1;
  if (gender === "Male") return 2;
  return 3;
}

function dobToISO(dob: string): string {
  const [dd, mm, yyyy] = dob.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

function useExpiryTimer(expiresAt: string | null) {
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      setSeconds(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return { seconds, expired: seconds === 0 };
}

export function ConfirmPaymentStep({ data, update, back, goTo }: StepProps) {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initiated = useRef(false);

  const { seconds, expired } = useExpiryTimer(expiresAt);

  useEffect(() => {
    if (!expired) return;
    const t = setTimeout(() => {
      update({ slot: null, appointmentId: null });
      goTo("date-time");
    }, 3000);
    return () => clearTimeout(t);
  }, [expired]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    if (!data.service || !data.visitType || !data.consultationMode || !data.slot || !data.patient) {
      setError("Booking data incomplete. Please go back and try again.");
      setLoading(false);
      return;
    }

    const { patient } = data;

    const run = async () => {
      let appointmentId = data.appointmentId;

      if (!appointmentId) {
        const suitabilityNotes = data.suitability
          ? Object.entries(data.suitability)
              .filter(([, v]) => v !== false && v !== "")
              .map(([k, v]) => `${k}: ${v === true ? "Yes" : v}`)
              .join("\n")
          : undefined;

        const bookingRes = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduleTime: data.slot,
            consultationMode: data.consultationMode,
            appointmentType: data.visitType,
            serviceCategory: data.service,
            ...(data.duration ? { duration: data.duration } : {}),
            ...(data.providerId ? { providerId: data.providerId } : {}),
            ...(suitabilityNotes ? { notes: suitabilityNotes } : {}),
            patient: {
              title: patient.title,
              firstName: patient.firstName,
              lastName: patient.lastName,
              dob: dobToISO(patient.dob),
              gender: mapGender(patient.gender),
              email: patient.email,
              mobilePhone: patient.mobile,
              address1: patient.address1,
              suburb: patient.suburb,
              state: patient.state,
              postcode: patient.postcode,
              emergencyContactName: patient.emergencyContactName,
              emergencyContactPhone: patient.emergencyContactPhone,
              emergencyRelationshipCode: RELATIONSHIP_CODE_BY_LABEL[patient.emergencyRelationship] ?? 19,
            },
          }),
        });

        if (!bookingRes.ok) {
          const body = await bookingRes.json().catch(() => ({}));
          throw new Error(body?.error ?? "This slot is no longer available. Please pick another time.");
        }

        const booking = await bookingRes.json();
        appointmentId = booking.appointmentId;
        update({ appointmentId: booking.appointmentId });
        setExpiresAt(booking.expiresAt);
      }

      const paymentRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          consultationMode: data.consultationMode,
          appointmentType: data.visitType,
          serviceCategory: data.service,
          scheduleTime: data.slot,
        }),
      });

      if (!paymentRes.ok) throw new Error("Failed to create checkout session. Please try again.");

      const { url } = await paymentRes.json();
      setCheckoutUrl(url);
    };

    run()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (!data.service || !data.visitType || !data.consultationMode) return null;

  const fee = pricingConfig[data.consultationMode][data.service][data.visitType];
  const duration = data.duration ?? 0;
  const m = seconds != null ? Math.floor(seconds / 60) : "--";
  const s = seconds != null ? String(seconds % 60).padStart(2, "0") : "--";

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Confirm and pay.</h1>
        <p className="text-sm text-muted-foreground">Here's your fee breakdown, including any Medicare rebate.</p>
        {loading ? (
          <p className="inline-block rounded-full bg-gray-50 px-6 py-3 text-lg font-medium text-gray-400">
            Securing your slot…
          </p>
        ) : error ? (
          <p className="inline-block rounded-full bg-red-50 px-6 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        ) : expired ? (
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
          <span>
            {serviceLabel[data.service]} · {visitTypeLabel[data.visitType]} ({duration} min)
          </span>
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
          disabled={loading || !!error || expired || !checkoutUrl}
          onClick={() => { if (checkoutUrl) window.location.href = checkoutUrl; }}
          className="w-full mt-4 py-6 text-base bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          {loading
            ? "Securing slot…"
            : expired
            ? "Slot expired"
            : `Confirm & Pay ${formatCurrency(fee.net)}`}
        </Button>

        <div className="pt-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            🔒 Secure payment by
          </p>
          <p className="text-2xl font-bold text-[#6E78FF] mt-1">stripe</p>
        </div>
      </div>

      {(expired || error) && (
        <button
          onClick={() => { update({ slot: null, appointmentId: null }); goTo("date-time"); }}
          className="text-sm font-medium text-[#6E78FF] underline underline-offset-4"
        >
          Back to pick a new time
        </button>
      )}
    </div>
  );
}
