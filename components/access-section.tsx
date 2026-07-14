import { Button } from "@/components/ui/button";

export function AccessSection() {
  return (
    <section>
      {/* ================= MOBILE ================= */}
      <div className="md:hidden bg-[#F3F5FB]">
        {/* Purple Content */}
        <div className="bg-primary px-6 py-8 text-white">
          <h3 className="text-[34px] font-bold leading-tight">
            Access the Care
            <br />
            you need
          </h3>

          <div className="my-6 h-[3px] w-full rounded-full bg-secondary" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg">Plant-based therapies</p>

              <Button className="h-10 rounded-xl bg-white px-5 text-primary hover:bg-white/90">
                Learn more
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-lg">Smoking cessation</p>

              <Button className="h-10 rounded-xl bg-white px-5 text-primary hover:bg-white/90">
                Learn more
              </Button>
            </div>
          </div>
        </div>

        {/* Image (Outside Purple Background) */}
        <div className="px-6 py-8">
          <img
            src="/dummy-1.png"
            alt="Peaceful wellness scene"
            className="w-full rounded-[24px] object-cover"
          />
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden bg-primary py-8 text-white md:block">
        <div className="container mx-auto flex items-center px-4 md:px-0">
          {/* Image */}
          <img
            src="/dummy-1.png"
            alt="Peaceful wellness scene"
            className="w-1/2"
          />

          {/* Content */}
          <div className="flex w-full flex-col items-end gap-4 pl-8 text-right">
            <h3 className="text-4xl font-semibold leading-tight">
              Access the Care
              <br />
              you need
            </h3>

            <div className="h-1 w-full bg-secondary" />

            <div className="flex w-full items-center justify-between">
              <p>Plant-based therapies</p>

              <Button className="h-9 rounded-lg bg-white px-6 text-primary hover:bg-white/90">
                Learn More
              </Button>
            </div>

            <div className="flex w-full items-center justify-between">
              <p>Smoking cessation</p>

              <Button className="h-9 rounded-lg bg-white px-6 text-primary hover:bg-white/90">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}