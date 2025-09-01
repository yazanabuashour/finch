"use client";

import { QuerySelect, type QuerySelectOption } from "~/components/query-select";

interface YearSelectorProps {
  years: { value: string; label: string }[];
  selectedYear?: string;
  extraParams?: Record<string, string | undefined>;
}

export function YearSelector({
  years,
  selectedYear,
  extraParams,
}: YearSelectorProps) {
  const options: QuerySelectOption[] = years.map((y) => ({
    value: y.value,
    label: y.label,
  }));
  return (
    <QuerySelect
      param="year"
      options={options}
      value={selectedYear}
      placeholder="Select year"
      extraParams={extraParams}
      clearParams={["month"]}
      triggerClassName="w-[140px]"
    />
  );
}
