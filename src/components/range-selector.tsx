"use client";

import { QuerySelect, type QuerySelectOption } from "~/components/query-select";

interface RangeSelectorProps {
  options: number[];
  selectedRange?: number;
  extraParams?: Record<string, string | undefined>;
}

export function RangeSelector({
  options,
  selectedRange,
  extraParams,
}: RangeSelectorProps) {
  const opts: QuerySelectOption[] = options.map((m) => ({
    value: String(m),
    label: `${m} months`,
  }));
  return (
    <QuerySelect
      param="range"
      options={opts}
      value={selectedRange ? String(selectedRange) : undefined}
      extraParams={extraParams}
      size="sm"
    />
  );
}
