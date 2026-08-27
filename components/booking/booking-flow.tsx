"use client";
import type { ComponentType } from "react";
import { useBookingFlow } from "@/hooks/use-booking-flow";
import { ProgressStepper } from "./progress-stepper";
import { ServiceStep } from "./steps/service-step";
import { FirstVisitStep } from "./steps/first-visit-step";
import { SuitabilityCheckStep } from "./steps/suitability-check-step";
import { ConsultationModeStep } from "./steps/consultation-mode-step";
import { DateTimeStep } from "./steps/date-time-step";
import { PatientDetailsStep } from "./steps/patient-details-step";
import { ReferringGPStep } from "./steps/referring-gp-step";
import { QuestionnaireStep } from "./steps/questionnaire-step";
import { ConfirmPaymentStep } from "./steps/confirm-payment-step";
import { ConfirmedStep } from "./steps/confirmed-step";
import type { StepId, StepProps } from "@/lib/booking/types";

const STEP_COMPONENTS: Record<StepId, ComponentType<StepProps>> = {
  service: ServiceStep,
  "first-visit": FirstVisitStep,
  suitability: SuitabilityCheckStep,
  "consultation-mode": ConsultationModeStep,
  "date-time": DateTimeStep,
  "patient-details": PatientDetailsStep,
  "referring-gp": ReferringGPStep,
  questionnaire: QuestionnaireStep,
  "confirm-payment": ConfirmPaymentStep,
  confirmed: ConfirmedStep,
};

// step dengan form 2 kolom butuh lebar lebih — sisanya (single column) tetep sempit
const WIDE_STEPS: StepId[] = ["patient-details", "questionnaire"];

export function BookingFlow() {
  const flow = useBookingFlow();
  const StepComponent = STEP_COMPONENTS[flow.currentStep];
  const isWide = WIDE_STEPS.includes(flow.currentStep);

  return (
    <>
      <ProgressStepper steps={flow.steps} currentIndex={flow.stepIndex} />
      <div className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/medical-pattern.png" alt="" className="w-full h-full object-cover opacity-100" />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at center, white 30%, transparent 75%)" }}
          />
        </div>
        <div className={`container mx-auto px-4 relative z-10 ${isWide ? "max-w-2xl" : "max-w-lg"}`}>
          <StepComponent {...flow} />
        </div>
      </div>
    </>
  );
}