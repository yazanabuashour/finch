"use client";

import { Progress } from "~/components/ui/progress";

interface CategoryBreakdownProps {
  data: {
    name: string;
    amount: number;
    total: number;
  }[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <div className="space-y-4">
      {data.map((category) => (
        <div key={category.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{category.name}</span>
            <span className="font-medium">${category.amount.toFixed(2)}</span>
          </div>
          <Progress
            value={(category.amount / category.total) * 100}
            className="h-2"
          />
        </div>
      ))}
    </div>
  );
}
