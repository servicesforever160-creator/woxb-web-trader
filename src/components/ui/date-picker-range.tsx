"use client";

import * as React from "react";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/src/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { motion } from "framer-motion";

type PresetRange =
  | "all"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "lastYear"
  | "tomorrow"
  | "nextWeek"
  | "nextMonth"
  | "custom";

type DatePickerRangeProps = {
  defaultPreset?: PresetRange;
  all?: boolean;
  thisMonthToDate?: boolean;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  autoOpenKey?: number;
  trigger?: React.ReactElement;
  triggerWrapperClassName?: string;
  contentAlign?: React.ComponentProps<typeof PopoverContent>["align"];
  onOpen?: () => void;
  previousMonth?: boolean;
  previousWeek?: boolean;
  lastWeek?: boolean;
  lastMonth?: boolean;
  yesterday?: boolean;
  today?: boolean;
  tomorrow?: boolean;
  nextWeek?: boolean;
  nextMonth?: boolean;
};

function getPresetDateRange(preset: PresetRange, date = new Date(), thisMonthToDate = true) {
  switch (preset) {
    case "all":
      return undefined;

    case "today":
      return {
        from: startOfDay(date),
        to: endOfDay(date),
      };

    case "yesterday": {
      const yesterday = subDays(date, 1);

      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    }

    case "thisWeek":
      return {
        from: startOfWeek(date),
        to: endOfWeek(date),
      };

    case "lastWeek": {
      const previousWeek = subWeeks(date, 1);
      return { from: startOfWeek(previousWeek), to: endOfWeek(previousWeek) };
    }

    case "thisMonth":
      return {
        from: startOfMonth(date),
        to: thisMonthToDate ? endOfDay(date) : endOfMonth(date),
      };

    case "lastMonth": {
      const previousMonth = subMonths(date, 1);
      return { from: startOfMonth(previousMonth), to: endOfMonth(previousMonth) };
    }

    case "lastYear": {
      const previousYear = subYears(date, 1);

      return {
        from: startOfYear(previousYear),
        to: endOfYear(previousYear),
      };
    }

    case "tomorrow": {
      const tomorrow = addDays(date, 1);

      return {
        from: startOfDay(tomorrow),
        to: endOfDay(tomorrow),
      };
    }

    case "nextWeek": {
      const nextWeek = addDays(date, 7);

      return {
        from: startOfWeek(nextWeek),
        to: endOfWeek(nextWeek),
      };
    }

    case "nextMonth": {
      const nextMonth = addDays(endOfMonth(date), 1);

      return {
        from: startOfMonth(nextMonth),
        to: endOfMonth(nextMonth),
      };
    }

    case "custom":
      return undefined;
  }
}

function formatRange(date: DateRange | undefined) {
  if (!date?.from) return "Pick a date";
  if (!date.to) return format(date.from, "LLL dd, y");

  return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`;
}

function formatFooterRange(date: DateRange | undefined) {
  if (!date?.from) return "Select a range";
  if (!date.to) return format(date.from, "LLL dd");

  return `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd")}`;
}

export function DatePickerRange({
  defaultPreset = "all",
  all = true,
  thisMonthToDate = true,
  date,
  onDateChange,
  autoOpenKey,
  trigger,
  triggerWrapperClassName,
  contentAlign = "start",
  onOpen,
  previousMonth = true,
  previousWeek = true,
  lastWeek = false,
  lastMonth = false,
  yesterday = true,
  today = true,
  tomorrow = false,
  nextWeek = false,
  nextMonth = false,
}: DatePickerRangeProps) {
  const [open, setOpen] = React.useState(false);
  const [draftDate, setDraftDate] = React.useState<DateRange | undefined>(date);
  const [activePreset, setActivePreset] =
    React.useState<PresetRange>(defaultPreset);
  const latestDateRef = React.useRef(date);
  const [customSelected, setCustomSelected] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);

  React.useEffect(() => {
    latestDateRef.current = date;
  }, [date]);

  React.useEffect(() => {
    if (autoOpenKey === undefined) return;

    setDraftDate(latestDateRef.current);
    setActivePreset("custom");
    setOpen(true);
  }, [autoOpenKey]);

  const presetButtons = [
    { key: "all", label: "All", enabled: all },
    { key: "today", label: "Today", enabled: today },
    { key: "yesterday", label: "Yesterday", enabled: yesterday },
    { key: "thisWeek", label: "This Week", enabled: previousWeek },
    { key: "lastWeek", label: "Last Week", enabled: lastWeek },
    { key: "thisMonth", label: "This Month", enabled: true },
    { key: "lastMonth", label: "Last Month", enabled: lastMonth },
    { key: "lastYear", label: "Last Year", enabled: previousMonth },
    { key: "tomorrow", label: "Tomorrow", enabled: tomorrow },
    { key: "nextWeek", label: "Next Week", enabled: nextWeek },
    { key: "nextMonth", label: "Next Month", enabled: nextMonth },
    { key: "custom", label: "Custom Range", enabled: true },
  ] satisfies Array<{ key: PresetRange; label: string; enabled: boolean }>;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      onOpen?.();
      setDraftDate(date);
      // setActivePreset("all");
    }
  };

  const handlePresetSelect = (preset: PresetRange) => {
    setActivePreset(preset);

    if (preset === "custom") {
      setCustomSelected(true);

      setTimeout(() => {
        setShowCalendar(true);
      }, 10);

      return;
    }

    setShowCalendar(false);
    setCustomSelected(false);

    const nextDate = getPresetDateRange(preset, new Date(), thisMonthToDate);

    setDraftDate(nextDate);
    onDateChange(nextDate);
    setOpen(false);
  };

  const handleCancel = () => {
    setDraftDate(date);
    setOpen(false);
  };

  const handleApply = () => {
    onDateChange(draftDate);
    setOpen(false);
  };

  return (
    <div className={triggerWrapperClassName ?? "w-full"}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            trigger ?? (
              <Button
                variant="outline"
                id="date-picker-range"
                className="h-10 w-full flex justify-start gap-2 rounded-lg px-3 text-xs font-medium"
              >
                <div className="flex">
                  <CalendarIcon className="size-3.5 mr-2 text-primary" />
                  <span className="truncate">{formatRange(date)}</span>
                </div>
              </Button>
            )
          }
        />

        <PopoverContent
          className={`${customSelected ? "w-[790px]" : "w-48"} max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border border-border bg-card p-0 shadow-xl shadow-black/10 ring-0 dark:border-primary/25 dark:shadow-none `}
          align={contentAlign}
          animation="scale"
        >
          <div className={`grid max-h-[calc(100vh-6rem)] grid-cols-1 overflow-auto ${customSelected ? "md:grid-cols-[190px_minmax(0,1fr)]" : "max-w-48"}`}>
            <div className="border-b border-border bg-background-muted/55 p-3 md:border-b-0 md:border-r dark:bg-background/70">
              <div className="space-y-1">
                {presetButtons
                  .filter((preset) => preset.enabled)
                  .map((preset) => {
                    const active = activePreset === preset.key;

                    return (
                      <Button variant="unstyled"
                        key={preset.key}
                        type="button"
                        onClick={() => handlePresetSelect(preset.key)}
                        className={cn(
                          "flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-xs font-medium transition-colors cursor-pointer",
                          active
                            ? "bg-primary text-primary-foreground dark:text-background!"
                            : "text-foreground/80 hover:bg-primary/[0.06] hover:text-foreground"
                        )}
                      >
                        <span>{preset.label}</span>
                        {active && <Check className="size-3.5 dark:text-background!" />}
                      </Button>
                    );
                  })}
              </div>
            </div>

            {
              customSelected && showCalendar &&

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.2,
                  delay: 0.08,
                  ease: "easeOut",
                }}
                className="min-w-0 p-3"
              >
                <Calendar
                  mode="range"
                  defaultMonth={draftDate?.from}
                  selected={draftDate}
                  onSelect={(range) => {
                    setDraftDate(range);
                    setActivePreset("custom");
                  }}
                  numberOfMonths={2}
                  className="w-full bg-transparent p-0 [--cell-size:2rem]"
                  classNames={{
                    root: "relative w-full",
                    months: "flex flex-col gap-5 lg:flex-row lg:gap-7",
                    month: "flex w-full min-w-[235px] flex-1 flex-col gap-3",
                    nav: "absolute inset-x-0 top-0 flex items-center justify-between",
                    button_previous:
                      "flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.06] text-primary transition-colors hover:bg-primary/[0.12]",
                    button_next:
                      "flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.06] text-primary transition-colors hover:bg-primary/[0.12]",
                    month_caption:
                      "flex h-9 items-center justify-center px-9 text-center",
                    caption_label:
                      "text-xs font-semibold text-foreground hover:bg-transparent",
                    weekdays: "flex border-0",
                    weekday:
                      "flex-1 py-1 text-center text-xs font-semibold uppercase text-muted-foreground",
                    week: "mt-1 flex w-full",
                    day: "relative aspect-square h-full w-full p-0 text-center",
                    day_button:
                      "rounded-md text-xs font-semibold text-foreground hover:bg-primary/[0.08] data-[range-start=true]:bg-primary data-[range-start=true]:text-[#3A2500] data-[range-end=true]:bg-primary data-[range-end=true]:text-[#3A2500] data-[selected-single=true]:bg-primary data-[selected-single=true]:text-[#3A2500] data-[range-middle=true]:bg-primary/[0.14] data-[range-middle=true]:text-primary",
                    today: "rounded-md bg-primary/[0.07] text-primary",
                    outside: "text-muted-foreground/45",
                    disabled: "text-muted-foreground/35 opacity-60",
                  }}
                />

                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-foreground">
                    {formatFooterRange(draftDate)}
                  </p>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="h-9 rounded-lg px-4 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleApply}
                      className="h-9 rounded-lg px-5 text-xs font-semibold shadow-none hover:shadow-none"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </motion.div>
            }
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
