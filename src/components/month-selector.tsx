"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface MonthSelectorProps {
  months: { value: string; label: string }[];
  selectedMonth?: string;
}

export function MonthSelector({ months, selectedMonth }: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleMonthChange = (value: string) => {
    router.push(`${pathname}?month=${value}`);
  };

  return (
    <Select value={selectedMonth} onValueChange={handleMonthChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
