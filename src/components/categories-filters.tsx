"use client";

import { MonthSelector } from "~/components/month-selector";

interface CategoriesFiltersProps {
  defaultMonth: string; // YYYY-MM
  currentRange: number; // preserve when submitting
  months: { value: string; label: string }[];
}

export function CategoriesFilters({
  defaultMonth,
  currentRange,
  months,
}: CategoriesFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Month:</span>
        <MonthSelector
          months={months}
          selectedMonth={defaultMonth}
          includeAllOption={false}
          extraParams={{ tab: "categories", range: String(currentRange) }}
        />
      </div>
    </div>
  );
}
