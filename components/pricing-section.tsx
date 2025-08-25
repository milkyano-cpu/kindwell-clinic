import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PricingSection() {
  return (
    <section className="bg-gradient-to-b from-[#FFE8D4] to-[#EDF1FF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xl font-semibold text-[#ADADAD] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-primary">
            Affordable alternative <br /> healthcare for everyday
          </h2>
        </div>

        <Tabs
          defaultValue="in-person"
          className="max-w-6xl mx-auto flex items-center"
        >
          <TabsList className="grid grid-cols-2 mb-8 bg-white">
            <TabsTrigger value="in-person">In-Person</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
          </TabsList>

          <div className="grid md:grid-cols-2 grid-cols-1 justify-center gap-10">
            <div className="flex justify-center items-start">
              <img
                className="md:w-2/3"
                src="/pricing-1.png"
                alt="Peaceful wellness scene"
              />
            </div>

            <div className="flex justify-center items-start">
              <img
                className="md:w-2/3"
                src="/pricing-2.png"
                alt="Peaceful wellness scene"
              />
            </div>

            <div className="flex justify-center items-start">
              <img
                className="md:w-2/3"
                src="/pricing-3.png"
                alt="Peaceful wellness scene"
              />
            </div>

            <div className="flex justify-center items-start">
              <img
                className="md:w-2/3"
                src="/pricing-4.png"
                alt="Peaceful wellness scene"
              />
            </div>

            <div className="flex justify-center items-start">
              <img
                className="md:w-2/3"
                src="/pricing-5.png"
                alt="Peaceful wellness scene"
              />
            </div>

            <div className="flex justify-center items-start">
              <img
                className="md:w-2/3"
                src="/pricing-6.png"
                alt="Peaceful wellness scene"
              />
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
