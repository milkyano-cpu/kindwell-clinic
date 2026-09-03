"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { StepProps } from "@/lib/booking/types";

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" });
}

function formatSlotDisplay(scheduleTime: string) {
  const [, time] = scheduleTime.split("T");
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
}

function toDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateTimeStep({ data, update, next, back }: StepProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    data.slot ? new Date(data.slot.slice(0, 10)) : undefined
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Fetch available dates for the viewed month
  useEffect(() => {
    if (!data.service || !data.visitType || !data.consultationMode) return;

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth() + 1;
    const durationParam = data.duration ? `&duration=${data.duration}` : "";

    setLoadingDates(true);
    fetch(
      `/api/availability?year=${year}&month=${month}&mode=${data.consultationMode}&type=${data.visitType}&service=${data.service}${durationParam}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setAvailableDates(json.availableDates ?? []))
      .catch(() => setAvailableDates([]))
      .finally(() => setLoadingDates(false));
  }, [viewMonth, data.service, data.visitType, data.consultationMode]);

  // Fetch time slots when a date is selected
  useEffect(() => {
    if (!date || !data.service || !data.visitType || !data.consultationMode) {
      setSlots([]);
      return;
    }
    const dateStr = toDateStr(date);
    const durationParam = data.duration ? `&duration=${data.duration}` : "";
    setLoadingSlots(true);
    setSlotsError(null);
    fetch(
      `/api/slots?date=${dateStr}&mode=${data.consultationMode}&type=${data.visitType}&service=${data.service}${durationParam}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((json) => setSlots(json.slots ?? []))
      .catch(() => setSlotsError("Couldn't load slots. Please try another date."))
      .finally(() => setLoadingSlots(false));
  }, [date, data.service, data.visitType, data.consultationMode]);

  const handleSelectDate = (d: Date | undefined) => {
    setDate(d);
    update({ slot: null });
    setOpen(false); // close popover immediately after date pick
  };

  const isDateDisabled = (d: Date) => {
    if (d < today) return true;
    if (loadingDates) return false;
    return !availableDates.includes(toDateStr(d));
  };

  const triggerLabel = data.slot
    ? `${formatDateDisplay(new Date(data.slot.slice(0, 10)))} at ${formatSlotDisplay(data.slot)}`
    : date
    ? formatDateDisplay(date)
    : "Select a date";

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Pick a date and time.</h1>
      <p className="text-muted-foreground text-sm">
        Choose a slot that suits you. We'll hold it while you finish.
      </p>

      {/* Date picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center justify-between rounded-xl border border-[#6E78FF] bg-white px-4 py-3 text-sm">
            <span className={data.slot ? "font-medium" : "text-muted-foreground"}>
              {triggerLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-[#6E78FF] flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            disabled={isDateDisabled}
            month={viewMonth}
            onMonthChange={setViewMonth}
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>

      {/* Time slots — shown below the date picker after a date is selected */}
      {date && (
        <div className="rounded-xl border border-[#6E78FF]/30 bg-white p-4 text-left space-y-3">
          <p className="text-sm font-medium text-center text-[#6E78FF]">
            Available times for {formatDateDisplay(date)}
          </p>

          {loadingSlots && (
            <p className="text-center text-sm text-muted-foreground py-2">Loading slots…</p>
          )}
          {slotsError && (
            <p className="text-center text-sm text-red-500 py-2">{slotsError}</p>
          )}
          {!loadingSlots && !slotsError && slots.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-2">
              No slots available — please pick another date.
            </p>
          )}
          {!loadingSlots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => update({ slot: s })}
                  className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    data.slot === s
                      ? "border-[#6E78FF] bg-[#6E78FF] text-white"
                      : "border-border hover:border-[#6E78FF]/50"
                  }`}
                >
                  {formatSlotDisplay(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <Button
          disabled={!data.slot}
          onClick={next}
          className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          Continue
        </Button>
        <button
          onClick={back}
          className="cursor-pointer text-xs font-semibold tracking-wide text-foreground underline underline-offset-4 transition-colors hover:text-[#6E78FF]"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
