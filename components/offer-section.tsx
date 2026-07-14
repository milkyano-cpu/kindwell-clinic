import { Button } from "@/components/ui/button";

export function OfferSection() {
  return (  
        <section className="bg-gradient-to-b from-[#E6F4D3] to-[#FFE8D4] py-16 px-4">
          <div className="text-center flex flex-col justify-center items-center gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-foreground italic mb-4">
                What's next?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Kindwell offers a free first consultation to explore safe,
                natural treatment options
              </p>
            </div>

            <img
              className="md:w-1/2"
              src="/dummy-2.png"
              alt="Peaceful wellness scene"
            />

            <Button
              size="lg"
              variant="outline"
              className="text-lg bg-white border-primary text-primary px-20"
            >
              Start for free today
            </Button>
          </div>
        </section>
    );
}