import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  UserCheck,
  Package,
  HeartHandshake,
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: CheckCircle,
    title: "Complete a Quick Pre-Screening",
    description:
      "Fill out a short questionnaire to check your eligibility for treatment.",
  },
  {
    number: 2,
    icon: Calendar,
    title: "Book an Appointment",
    description: "Choose a time that suits you - in-clinic or via telehealth.",
  },
  {
    number: 3,
    icon: UserCheck,
    title: "Consult with a Qualified Practitioner",
    description:
      "Speak with an experienced nurse practitioner or doctor to assess your needs.",
  },
  {
    number: 4,
    icon: Package,
    title: "Access Your Treatment",
    description:
      "Pick up your treatment discreetly from our partner pharmacy or have it delivered to your door.",
  },
  {
    number: 5,
    icon: HeartHandshake,
    title: "Ongoing Support",
    description:
      "We're here for follow-ups, adjustments, and continued care whenever you need it.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#E6F4D3]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access the care you need with our simple 5-step process
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-8 justify-center">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="relative overflow-hidden w-sm rounded-4xl"
              >
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                        {step.number}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <step.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <b className="text-foreground mb-2">{step.title}</b>
                          <sub className="text-muted-foreground leading-relaxed flex">
                            {step.description}
                          </sub>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
