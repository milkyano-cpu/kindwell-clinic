import { BookingFlow } from "@/components/booking/booking-flow";
import type { ConsultationMode, ServiceType } from "@/lib/booking/types";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; mode?: string }>;
}) {
  const params = await searchParams;

  return (
    <BookingFlow
      initialService={params.service as ServiceType | undefined}
      initialMode={params.mode as ConsultationMode | undefined}
    />
  );
}