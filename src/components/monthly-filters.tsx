"use client";

import { RangeSelector } from "~/components/range-selector";
import { RANGE_OPTIONS } from "~/lib/constants";

interface MonthlyFiltersProps {
  defaultRange: number; // months
  currentMonth: string; // YYYY-MM, preserved when submitting
}

export function MonthlyFilters({
  defaultRange,
  currentMonth,
}: MonthlyFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Range:</span>
        <RangeSelector
          options={Array.from(RANGE_OPTIONS)}
          selectedRange={defaultRange}
          extraParams={{ tab: "monthly", month: currentMonth }}
          showPendingSpinner={false}
        />
      </div>
    </div>
  );
}
