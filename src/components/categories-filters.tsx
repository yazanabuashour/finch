"use client";

import { MonthSelector } from "~/components/month-selector";
import { YearSelector } from "~/components/year-selector";

interface CategoriesFiltersProps {
  defaultMonth: string; // YYYY-MM
  currentRange: number; // preserve when submitting
  months: { value: string; label: string }[];
  years?: { value: string; label: string }[];
  defaultYear?: string; // YYYY
  mode?: "monthly" | "yearly" | "both";
}

export function CategoriesFilters({
  defaultMonth,
  currentRange,
  months,
  years,
  defaultYear,
  mode = "both",
}: CategoriesFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {(mode === "both" || mode === "monthly") && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Month:</span>
          <MonthSelector
            months={months}
            selectedMonth={defaultMonth}
            includeAllOption={false}
            extraParams={{
              tab: "categories",
              cview: "monthly",
              range: String(currentRange),
            }}
            clearParams={["year"]}
          />
        </div>
      )}
      {(mode === "both" || mode === "yearly") && years && years.length > 0 && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Year:</span>
          <YearSelector
            years={years}
            selectedYear={defaultYear}
            extraParams={{
              tab: "categories",
              cview: "yearly",
              range: String(currentRange),
            }}
          />
        </div>
      )}
    </div>
  );
}
