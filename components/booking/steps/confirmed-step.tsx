import type { StepProps } from "@/lib/booking/types";

export function ConfirmedStep({ data }: StepProps) {
  const lines =
    data.consultationMode === "telehealth"
      ? ["We've sent your confirmation by email and SMS.", "Your doctor will call you at your booked time — keep your phone nearby."]
      : ["We've sent your confirmation by email.", "See you at the clinic at your booked time."];

  return (
    <div className="flex justify-center">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center max-w-md w-full space-y-2">
        <p className="text-3xl">🎉</p>
        <p className="text-muted-foreground font-medium">Thank you!</p>
        <h1 className="text-4xl font-bold text-[#6E78FF] pt-5">You're booked!</h1>
        <div className="text-sm text-muted-foreground pt-1">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}