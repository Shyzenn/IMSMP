"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  onChange?: (range: { from?: Date; to?: Date }) => void;
}

export function DateRangeFilter({ onChange }: DateRangeFilterProps) {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [month, setMonth] = React.useState<Date>(new Date());

  const handleSelect = (selected: DateRange | undefined) => {
    setDate(selected);
    onChange?.({
      from: selected?.from,
      to: selected?.to,
    });
  };

  // Handle year change
  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(event.target.value);
    const newDate = new Date(month);
    newDate.setFullYear(newYear);
    setMonth(newDate);
  };

  // Generate year options (5 years before and after current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM dd, yyyy")} -{" "}
                {format(date.to, "MMM dd, yyyy")}
              </>
            ) : (
              format(date.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end">
        {/* Header above the calendar */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Year:</label>
            <select
              value={month.getFullYear()}
              onChange={handleYearChange}
              className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Selected date range */}
          <div className="text-xs text-gray-600">
            {date?.from ? (
              date.to ? (
                <>
                  <span className="font-semibold text-sm">From:</span>{" "}
                  {format(date.from, "MMM dd, yyyy")} &nbsp;
                  <span className="font-semibold text-sm">To:</span>{" "}
                  {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                <>
                  <span className="font-semibold text-sm">From:</span>{" "}
                  {format(date.from, "MMM dd, yyyy")}
                </>
              )
            ) : (
              <span className="font-semibold text-sm">Select range below</span>
            )}
          </div>
        </div>

        {/* Calendar */}
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
          month={month}
          onMonthChange={setMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
