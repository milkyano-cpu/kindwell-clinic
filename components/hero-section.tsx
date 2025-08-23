import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, Users, Award, Heart } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/medical-pattern.png"
          alt="Peaceful wellness scene"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center bg-white flex flex-col justify-center items-center">
          <Badge variant="secondary" className="mb-6">
            <Heart className="w-4 h-4 mr-2" />
            125+ Satisfied Customers
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Your Wellness Journey
            <br />
            Starts <span className="text-secondary">Today</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Kindwell offers affordable, compassionate care from qualified
            professionals - in person or online.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="outline"
              className="text-lg bg-transparent border-primary text-primary w-full"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </Button>
            <Button className="text-lg w-full">Free Consultation</Button>
          </div>

          <div className="relative">
            <svg
              className="w-6 absolute animate-pulse md:-bottom-20"
              viewBox="0 0 22 63"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.64698 6.94678C2.89311 6.70073 3.22689 6.5625 3.57492 6.5625C3.92294 6.5625 4.25672 6.70073 4.50285 6.94678L10.9997 13.4437L17.4966 6.94678C17.7441 6.7077 18.0757 6.57541 18.4198 6.5784C18.764 6.58139 19.0931 6.71942 19.3365 6.96277C19.5798 7.20612 19.7179 7.53531 19.7209 7.87944C19.7239 8.22358 19.5916 8.55512 19.3525 8.80266L11.9277 16.2275C11.6815 16.4735 11.3478 16.6118 10.9997 16.6118C10.6517 16.6118 10.3179 16.4735 10.0718 16.2275L2.64698 8.80266C2.40092 8.55653 2.2627 8.22275 2.2627 7.87472C2.2627 7.52669 2.40092 7.19291 2.64698 6.94678Z"
                fill="#6E78FF"
              />
              <path
                d="M2.64698 27.9468C2.89311 27.7007 3.22689 27.5625 3.57492 27.5625C3.92294 27.5625 4.25672 27.7007 4.50285 27.9468L10.9997 34.4437L17.4966 27.9468C17.7441 27.7077 18.0757 27.5754 18.4198 27.5784C18.764 27.5814 19.0931 27.7194 19.3365 27.9628C19.5798 28.2061 19.7179 28.5353 19.7209 28.8794C19.7239 29.2236 19.5916 29.5551 19.3525 29.8027L11.9277 37.2275C11.6815 37.4735 11.3478 37.6118 10.9997 37.6118C10.6517 37.6118 10.3179 37.4735 10.0718 37.2275L2.64698 29.8027C2.40092 29.5565 2.2627 29.2227 2.2627 28.8747C2.2627 28.5267 2.40092 28.1929 2.64698 27.9468Z"
                fill="#A0AFFF"
              />
              <path
                d="M2.64698 48.9468C2.89311 48.7007 3.22689 48.5625 3.57492 48.5625C3.92294 48.5625 4.25672 48.7007 4.50285 48.9468L10.9997 55.4437L17.4966 48.9468C17.7441 48.7077 18.0757 48.5754 18.4198 48.5784C18.764 48.5814 19.0931 48.7194 19.3365 48.9628C19.5798 49.2061 19.7179 49.5353 19.7209 49.8794C19.7239 50.2236 19.5916 50.5551 19.3525 50.8027L11.9277 58.2275C11.6815 58.4735 11.3478 58.6118 10.9997 58.6118C10.6517 58.6118 10.3179 58.4735 10.0718 58.2275L2.64698 50.8027C2.40092 50.5565 2.2627 50.2227 2.2627 49.8747C2.2627 49.5267 2.40092 49.1929 2.64698 48.9468Z"
                fill="#C4CFFF"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
