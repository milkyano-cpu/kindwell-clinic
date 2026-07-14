import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const steps = [
  {
    number: 1,
    image: "/works1.png",
    title: "Complete a Quick Pre-Screening",
    description:
      "Fill out a short questionnaire to check your eligibility for treatment.",
  },
  {
    number: 2,
    image: "/works2.png",
    title: "Book and Appointment",
    description:
      "Choose a time that suits you — in-clinic or via telehealth.",
  },
  {
    number: 3,
    image: "/works3.png",
    title: "Consult with a Qualified Practitioner",
    description:
      "Speak with an experienced nurse practitioner or doctor to assess your needs.",
  },
  {
    number: 4,
    image: "/works4.png",
    title: "Access Your Treatment",
    description:
      "Pick up your treatment discreetly from our partner pharmacy or have it delivered to your door.",
  },
  {
    number: 5,
    image: "/works5.png",
    title: "Ongoing Support",
    description:
      "We're here for follow-ups, adjustments, and continued care whenever you need it.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24"
      style={{
        background:
          "linear-gradient(180deg,#EEF7DD 0%, #E6F4D3 100%)",
      }}
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black">
            How it works
          </h2>
        </div>

        {/* Desktop */}
        <div className="hidden md:block max-w-7xl mx-auto">
          {/* Row 1 */}
          <div className="flex justify-center gap-10 mb-10">
            {steps.slice(0, 2).map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex justify-center gap-10">
            {steps.slice(2).map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex flex-col items-center gap-8 md:hidden">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
}: {
  step: {
    number: number;
    image: string;
    title: string;
    description: string;
  };
}) {
  return (
    <Card className="w-full max-w-[355px] rounded-[32px] border-0 bg-white shadow-none">
      <CardContent className="p-5">
        {/* Image */}
        <div className="relative h-[185px] overflow-hidden rounded-3xl">
          <Image
            src={step.image}
            alt={step.title}
            fill
            className="object-cover"
          />
        </div>

          {/* Number */}
          <div className="flex justify-center mt-5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6774F6] text-sm font-bold text-white">
              {step.number}
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
          <h3 className="text-[20px] font-bold leading-tight text-[#2F2F2F]">
            {step.title}
          </h3>

          <p className="mt-3 text-[16px] leading-6 text-[#5E5E5E]">
            {step.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}