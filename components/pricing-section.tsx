"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConsultationMode, ServiceType } from "@/lib/booking/types";

type PricingItem = {
  duration: string;
  name: string;
  patientType?: string;
  price: string;
  originalPrice?: string;
  note?: string;
};

type PricingCardData = {
  badgeText: string;
  badgeClassName: string;
  title: string;
  subtitle: string;
  subtitleClassName: string;
  items: PricingItem[];
  noteVariant: "muted" | "promo";
  service: ServiceType;
  mode: ConsultationMode;
};

const inPersonCards: PricingCardData[] = [
  {
    badgeText: "STANDARD PRICING",
    badgeClassName: "bg-gray-400",
    title: "Alternative Medicine",
    subtitle: "Alternative Medicine",
    subtitleClassName: "text-[#8CC63F]",
    noteVariant: "muted",
    service: "alternative-medicine",
    mode: "face-to-face",
    items: [
      {
        duration: "20 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$119",
      },
      {
        duration: "10 minutes",
        name: "Review Consultation",
        patientType: "Existing Patients",
        price: "$59",
      },
    ],
  },
  {
    badgeText: "STANDARD PRICING",
    badgeClassName: "bg-gray-400",
    title: "Smoking Cessation",
    subtitle: "Smoking Cessation",
    subtitleClassName: "text-[#FF8D54]",
    noteVariant: "muted",
    service: "smoking-cessation",
    mode: "face-to-face",
    items: [
      {
        duration: "15 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$59",
      },
      {
        duration: "10 minutes",
        name: "Review Consultation",
        patientType: "Existing Patients",
        price: "$49",
      },
    ],
  },
];

const telehealthCards: PricingCardData[] = [
  {
    badgeText: "STANDARD PRICING",
    badgeClassName: "bg-gray-400",
    title: "Alternative Medicine",
    subtitle: "Alternative Medicine",
    subtitleClassName: "text-[#8CC63F]",
    noteVariant: "muted",
    service: "alternative-medicine",
    mode: "telehealth",
    items: [
      {
        duration: "20 minutes",
        name: "Initial Consultation",
        patientType: "New Patients",
        price: "$89",
      },
      {
        duration: "10 minutes",
        name: "Review Consultation",
        patientType: "Existing Patients",
        price: "$59",
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
                  {item.originalPrice && (
                    <p className="text-xs text-muted-foreground line-through">
                      {item.originalPrice}
                    </p>
                  )}
                </div>
              </div>
              {item.note && (
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
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        <Button
          asChild
          className="w-full h-12 rounded-xl bg-[#FF8D54] hover:bg-[#FF8D54]/90 text-white text-base font-semibold"
        >
          <a href={`/booking?service=${data.service}&mode=${data.mode}`}>Book Now</a>
        </Button>
      </div>
    </div>
  );
}

const tabVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export function PricingSection() {
  const [tab, setTab] = useState<"in-person" | "telehealth">("in-person");
  const [dir, setDir] = useState(1);

  const switchTab = (next: "in-person" | "telehealth") => {
    if (next === tab) return;
    setDir(next === "telehealth" ? 1 : -1);
    setTab(next);
  };

  const cards = tab === "in-person" ? inPersonCards : telehealthCards;

  return (
    <section className="bg-gradient-to-b from-[#FFE8D4] to-[#EDF1FF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xl font-semibold text-[#ADADAD] mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-primary">
            Affordable alternative <br /> healthcare for everyday
          </h2>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 mb-10 bg-white rounded-full p-1 h-auto shadow-sm">
            {(["in-person", "telehealth"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-medium transition-colors",
                  tab === t ? "bg-primary text-white" : "text-foreground hover:text-primary"
                )}
              >
                {t === "in-person" ? "Face To Face" : "Telehealth"}
              </button>
            ))}
          </div>

          {/* Animated cards */}
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={tab}
                custom={dir}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className={cn(
                  "grid grid-cols-1 gap-6 md:gap-10 items-stretch",
                  cards.length === 1 ? "md:grid-cols-1 max-w-sm mx-auto" : "md:grid-cols-2"
                )}
              >
                {cards.map((card) => (
                  <PricingCard key={card.title} data={card} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-8 px-6 text-center text-[14px] leading-6 text-primary md:hidden">
          Patients seeking both alternative medicine
          <br />
          and smoking cessation must book
          <br />
          an alternative medicine consultation.
        </p>
      </div>
    </section>
  );
}