"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { StepProps } from "@/lib/booking/types";

// TODO: ganti mock ini pake live query ke Medirecords API (Step 5, CORE)
const mockTimes = ["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

export function DateTimeStep({ data, update, next }: StepProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    data.slot ? new Date(data.slot.date) : undefined
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSelectDate = (d: Date | undefined) => {
    setDate(d);
    update({ slot: null }); // reset time kalau tanggal diganti
  };

  const handleSelectTime = (time: string) => {
    if (!date) return;
    update({ slot: { date: date.toISOString(), time } });
    setOpen(false);
  };

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Pick a date and time.</h1>
      <p className="text-muted-foreground text-sm">Choose a slot that suits you. We'll hold it while you finish.</p>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between rounded-xl border border-[#6E78FF] bg-white px-4 py-3 text-sm">
            <span>{date ? formatDate(date) : "Select a date"}</span>
            <ChevronDown className="h-4 w-4 text-[#6E78FF]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto space-y-3 p-4" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            disabled={{ before: today }}
          />
          {date && (
            <div className="grid grid-cols-2 gap-2 border-t pt-3">
              {mockTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectTime(t)}
                  className={`rounded-lg border p-2 text-sm ${
                    data.slot?.time === t ? "border-[#6E78FF] bg-[#6E78FF]/5" : "border-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      <div className="flex justify-center">
        <Button
          disabled={!data.slot}
          onClick={next}
          className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}