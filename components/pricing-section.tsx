import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PricingItem = {
  duration: string;
  name: string;
  patientType?: string;
  price: string;
  originalPrice: string;
  note: string;
};

type PricingCardData = {
  badgeText: string;
  badgeClassName: string;
  title: string;
  subtitle: string;
  subtitleClassName: string;
  items: PricingItem[];
  noteVariant: "muted" | "promo";
  bookNowHref?: string;
};

const inPersonCards: PricingCardData[] = [
  {
    badgeText: "MEDICARE CLAIM!",
    badgeClassName: "bg-[#8CC63F]",
    title: "Alternative Medicine",
    subtitle: "Medicinal Cannabis",
    subtitleClassName: "text-[#8CC63F]",
    noteVariant: "muted",
    items: [
      {
        duration: "30 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$4.10*",
        originalPrice: "$89",
        note: "After $84.90 Rebate from Medicare",
      },
      {
        duration: "30 minutes",
        name: "Transfer from another clinic",
        price: "$4.10*",
        originalPrice: "$89",
        note: "After $84.90 Rebate from Medicare",
      },
      {
        duration: "30 minutes",
        name: "Review Consultation",
        patientType: "Existing Patients",
        price: "$15.10*",
        originalPrice: "$59",
        note: "After $43.90 Rebate from Medicare",
      },
    ],
  },
  {
    badgeText: "MEDICARE CLAIM!",
    badgeClassName: "bg-[#8CC63F]",
    title: "Smoking Cessation",
    subtitle: "Smoking Cessation",
    subtitleClassName: "text-[#FF8D54]",
    noteVariant: "muted",
    items: [
      {
        duration: "15 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$15.10*",
        originalPrice: "$59",
        note: "Rebate $43.90 from Medicare",
      },
      {
        duration: "10 minutes",
        name: "Transfer from another clinic",
        price: "$5.10*",
        originalPrice: "$49",
        note: "Rebate $43.90 from Medicare",
      },
    ],
  },
];

const telehealthCards: PricingCardData[] = [
  {
    badgeText: "50% LIMITED TIME!",
    badgeClassName: "bg-primary",
    title: "Alternative Medicine",
    subtitle: "Medicinal Cannabis",
    subtitleClassName: "text-[#8CC63F]",
    noteVariant: "promo",
    items: [
      {
        duration: "30 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$45",
        originalPrice: "$89",
        note: "Promo Price",
      },
      {
        duration: "30 minutes",
        name: "Transfer from another clinic",
        price: "$45",
        originalPrice: "$89",
        note: "Promo Price",
      },
      {
        duration: "30 minutes",
        name: "Review Consultation",
        patientType: "Existing Patients",
        price: "$29",
        originalPrice: "$59",
        note: "Promo Price",
      },
    ],
  },
  {
    badgeText: "50% LIMITED TIME!",
    badgeClassName: "bg-primary",
    title: "Smoking Cessation",
    subtitle: "Smoking Cessation",
    subtitleClassName: "text-[#FF8D54]",
    noteVariant: "promo",
    items: [
      {
        duration: "15 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$29",
        originalPrice: "$59",
        note: "Rebate $43.90 from Medicare",
      },
      {
        duration: "10 minutes",
        name: "Transfer from another clinic",
        price: "$25",
        originalPrice: "$49",
        note: "Rebate $43.90 from Medicare",
      },
    ],
  },
];

function PricingCard({ data }: { data: PricingCardData }) {
  return (
    <div className="flex flex-col h-full rounded-2xl bg-white shadow-sm overflow-hidden">
      <div
        className={cn(
          "py-3 text-center text-sm font-bold tracking-wide text-white",
          data.badgeClassName
        )}
      >
        {data.badgeText.includes("50%") ? (
          <>
            <span className="font-extrabold">50%</span>{" "}
            <span className="font-semibold">LIMITED TIME!</span>
          </>
        ) : (
          data.badgeText
        )}
      </div>

      <div className="flex-1 p-6">
        <h3 className="text-xl md:text-2xl font-bold text-foreground">
          {data.title}
        </h3>
        <p className={cn("text-sm font-semibold mb-4 text-center", data.subtitleClassName)}>
          {data.subtitle}
        </p>

        {data.items.map((item, idx) => (
          <div key={idx}>
            <hr className="border-gray-100" />
            <div className="py-3">
              <p className="text-xs text-muted-foreground mb-1">
                {item.duration}
              </p>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm md:text-base leading-snug">
                    {item.name}
                  </p>
                  {item.patientType && (
                    <p className="text-xs text-muted-foreground">
                      {item.patientType}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#FF8D54] font-bold text-lg md:text-xl leading-tight">
                    {/* Mobile */}
                    <span className="md:hidden">
                      {item.price.replace("*", "")}
                    </span>

                    {/* Desktop */}
                    <span className="hidden md:inline">
                      {item.price}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground line-through">
                    {item.originalPrice}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "text-center text-xs md:text-sm py-2 rounded-md mt-2",
                  data.noteVariant === "promo"
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-50 text-gray-300"
                )}
              >
                {item.note}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        <Button
          asChild
          className="w-full h-12 rounded-xl bg-[#FF8D54] hover:bg-[#FF8D54]/90 text-white text-base font-semibold"
        >
          <a href={data.bookNowHref ?? "#"}>Book Now</a>
        </Button>
      </div>
    </div>
  );
}

export function PricingSection() {
  return (
    <section className="bg-gradient-to-b from-[#FFE8D4] to-[#EDF1FF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xl font-semibold text-[#ADADAD] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-primary">
            Affordable alternative <br /> healthcare for everyday
          </h2>
        </div>

        <Tabs defaultValue="in-person" className="max-w-4xl mx-auto flex flex-col items-center">
          <TabsList className="grid grid-cols-2 mb-10 bg-white rounded-full p-1 h-auto">
            <TabsTrigger
              value="in-person"
              className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              In-Person
            </TabsTrigger>
            <TabsTrigger
              value="telehealth"
              className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Telehealth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-person" className="w-full">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 md:gap-10 items-stretch">
              {inPersonCards.map((card) => (
                <PricingCard key={card.title} data={card} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="telehealth" className="w-full">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 md:gap-10 items-stretch">
              {telehealthCards.map((card) => (
                <PricingCard key={card.title} data={card} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
