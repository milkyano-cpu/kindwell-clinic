"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { ConsultationMode } from "@/lib/booking/types";

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<ConfirmedFallback />}>
      <ConfirmedContent />
    </Suspense>
  );
}

function ConfirmedFallback() {
  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-[60vh]">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center max-w-md w-full space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-muted-foreground font-medium">Thank you!</p>
        <h1 className="text-4xl font-bold text-[#6E78FF] pt-5">You&apos;re booked!</h1>
      </div>
    </div>
  );
}

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const consultationMode = searchParams.get("mode") as ConsultationMode | null;

  useEffect(() => {
    sessionStorage.removeItem("kindwell-booking");
  }, []);

  const lines =
    consultationMode === "telehealth"
      ? [
          "We've sent your confirmation by email and SMS.",
          "Your doctor will call you at your booked time — keep your phone nearby.",
        ]
      : [
          "We've sent your confirmation by email.",
          "See you at the clinic at your booked time.",
        ];

  return (
    <div className="container mx-auto px-4 flex justify-center items-center min-h-[60vh]">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center max-w-md w-full space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-muted-foreground font-medium">Thank you!</p>
        <h1 className="text-4xl font-bold text-[#6E78FF] pt-5">You&apos;re booked!</h1>
        <div className="text-sm text-muted-foreground pt-1">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}