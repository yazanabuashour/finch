"use client";

import { QuerySelect } from "~/components/query-select";

interface MonthSelectorProps {
  months: { value: string; label: string }[];
  selectedMonth?: string;
  includeAllOption?: boolean;
  extraParams?: Record<string, string | undefined>;
}

export function MonthSelector({
  months,
  selectedMonth,
  includeAllOption = true,
  extraParams,
}: MonthSelectorProps) {
  const options = [
    ...(includeAllOption ? [{ value: "all", label: "All Months" }] : []),
    ...months,
  ];
  return (
    <QuerySelect
      param="month"
      options={options}
      value={selectedMonth}
      placeholder="Select month"
      extraParams={extraParams}
      triggerClassName="w-[180px]"
    />
  );
}
