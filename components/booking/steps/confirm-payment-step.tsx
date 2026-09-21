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

function formatSlot(slot: string): string {
  const [datePart, timePart] = slot.split("T");
  const date = new Date(`${datePart}T12:00:00`);
  const [hStr, mStr] = timePart.split(":");
  const h = parseInt(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const dateLabel = date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${dateLabel} at ${h12}:${mStr} ${period}`;
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

export function ConfirmPaymentStep({ data, update, goTo }: StepProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const initiated = useRef(false);

  const { seconds, expired } = useExpiryTimer(data.expiresAt);

  useEffect(() => {
    if (!expired) return;
    const t = setTimeout(() => {
      update({ slot: null, appointmentId: null, bookingKey: null, expiresAt: null });
      goTo("date-time");
    }, 3000);
    return () => clearTimeout(t);
  }, [expired]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCheckoutUrl = async (appointmentId: string) => {
    const paymentRes = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        consultationMode: data.consultationMode,
        appointmentType: data.visitType,
        serviceCategory: data.service,
        scheduleTime: data.slot,
        ...(data.duration ? { durationMinutes: data.duration } : {}),
      }),
    });
    if (!paymentRes.ok) throw new Error("Failed to create checkout session. Please try again.");
    const { url } = await paymentRes.json();
    setCheckoutUrl(url);
  };

  const handleRetryPayment = async () => {
    if (!data.appointmentId) return;
    setPaymentError(null);
    setRetrying(true);
    try {
      await fetchCheckoutUrl(data.appointmentId);
    } catch (err) {
      setPaymentError((err as Error).message);
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const needsPatient = data.visitType === "initial";
    if (!data.service || !data.visitType || !data.consultationMode || !data.slot || !data.email || (needsPatient && !data.patient)) {
      setBookingError("Booking data incomplete. Please go back and try again.");
      setLoading(false);
      return;
    }

    // Generate idempotency key once per slot selection — persisted in sessionStorage
    if (!data.bookingKey) {
      update({ bookingKey: crypto.randomUUID() });
    }

    const { patient } = data;
    const isFollowUp = data.visitType === "follow-up";

    const run = async () => {
      let appointmentId = data.appointmentId;

      if (!appointmentId) {
        const bookingKey = data.bookingKey ?? crypto.randomUUID();
        const suitabilityNotes = data.suitability
          ? Object.entries(data.suitability)
              .filter(([, v]) => v !== false && v !== "")
              .map(([k, v]) => `${k}: ${v === true ? "Yes" : v}`)
              .join("\n")
          : undefined;

        const patientPayload = isFollowUp
          ? { email: data.email, mobilePhone: data.mobile }
          : patient && {
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
            };

        const bookingRes = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": bookingKey },
          body: JSON.stringify({
            scheduleTime: data.slot,
            consultationMode: data.consultationMode,
            appointmentType: data.visitType,
            serviceCategory: data.service,
            ...(data.duration ? { duration: data.duration } : {}),
            ...(data.providerId ? { providerId: data.providerId } : {}),
            ...(suitabilityNotes ? { notes: suitabilityNotes } : {}),
            patient: patientPayload,
          }),
        });

        if (!bookingRes.ok) {
          const body = await bookingRes.json().catch(() => ({}));
          if (body?.type === "address_validation") {
            setAddressError(body.error ?? "Your address details are invalid. Please check and try again.");
            return;
          }
          throw new Error(body?.error ?? "This slot is no longer available. Please pick another time.");
        }

        const booking = await bookingRes.json();
        appointmentId = booking.appointmentId;
        update({ appointmentId: booking.appointmentId, expiresAt: booking.expiresAt });
      }

      if (!appointmentId) throw new Error("Booking failed — no appointment ID.");

      try {
        await fetchCheckoutUrl(appointmentId);
      } catch (err) {
        setPaymentError((err as Error).message);
      }
    };

    run()
      .catch((err: Error) => setBookingError(err.message))
      .finally(() => setLoading(false));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!data.service || !data.visitType || !data.consultationMode || data.grossCents == null) return null;

  const fee = pricingConfig[data.consultationMode][data.service][data.visitType];
  const duration = data.duration ?? fee.durationMinutes;
  const grossCents = data.grossCents;
  const m = seconds != null ? Math.floor(seconds / 60) : "--";
  const s = seconds != null ? String(seconds % 60).padStart(2, "0") : "--";
  const patient = data.patient;
  const isFollowUpView = data.visitType === "follow-up";
  const error = bookingError ?? addressError ?? paymentError;

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Confirm and pay.</h1>
        <p className="text-sm text-muted-foreground">Review your booking details before paying.</p>
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

      <div className="rounded-2xl bg-white p-8 shadow-sm text-left space-y-5">
        {/* Booking details */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#6E78FF]">Appointment</p>
          <div className="space-y-2 text-sm">
            {data.slot && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Date & time</span>
                <span className="font-medium text-right">{formatSlot(data.slot)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Service</span>
              <span className="font-medium text-right">
                {serviceLabel[data.service]} · {visitTypeLabel[data.visitType]} ({duration} min)
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Mode</span>
              <span className="font-medium">{modeLabel[data.consultationMode]}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">Doctor</span>
              <span className="font-medium">{data.providerName ?? "No preferred doctor"}</span>
            </div>
            {isFollowUpView ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Patient</span>
                <span className="font-medium">{data.email}</span>
              </div>
            ) : patient && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Patient</span>
                <span className="font-medium">{patient.firstName} {patient.lastName}</span>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Fee */}
        <div className="flex justify-between pt-2 font-bold">
          <span>Total due today</span>
          <span>{formatCurrency(grossCents)}</span>
        </div>

        <Button
          disabled={loading || !!bookingError || expired || !checkoutUrl}
          onClick={() => { if (checkoutUrl) window.location.href = checkoutUrl; }}
          className="w-full mt-4 py-6 text-base bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          {loading
            ? "Securing slot…"
            : expired
            ? "Slot expired"
            : `Confirm & Pay ${formatCurrency(grossCents)}`}
        </Button>

        {paymentError && (
          <button
            onClick={handleRetryPayment}
            disabled={retrying}
            className="w-full mt-2 py-3 text-sm font-medium text-[#6E78FF] underline underline-offset-4 disabled:opacity-50"
          >
            {retrying ? "Retrying…" : "Try again"}
          </button>
        )}

        <div className="pt-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            🔒 Secure payment by
          </p>
          <p className="text-2xl font-bold text-[#6E78FF] mt-1">stripe</p>
        </div>
      </div>

      {addressError && !isFollowUpView && (
        <button
          onClick={() => goTo("patient-details")}
          className="text-sm font-medium text-[#6E78FF] underline underline-offset-4"
        >
          Fix address details
        </button>
      )}
      {(expired || bookingError) && (
        <button
          onClick={() => { update({ slot: null, appointmentId: null, bookingKey: null, expiresAt: null }); goTo("date-time"); }}
          className="text-sm font-medium text-[#6E78FF] underline underline-offset-4"
        >
          Back to pick a new time
        </button>
      )}
    </div>
  );
}
