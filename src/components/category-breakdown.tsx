"use client";

import { Progress } from "~/components/ui/progress";

export function CategoryBreakdown() {
  // In a real app, this would come from your database
  const categories = [
    { name: "Food", amount: 850, total: 2950, color: "#10b981" },
    { name: "Housing", amount: 1200, total: 2950, color: "#3b82f6" },
    { name: "Transportation", amount: 350, total: 2950, color: "#6366f1" },
    { name: "Utilities", amount: 200, total: 2950, color: "#8b5cf6" },
    { name: "Entertainment", amount: 150, total: 2950, color: "#ec4899" },
    { name: "Healthcare", amount: 120, total: 2950, color: "#f43f5e" },
    { name: "Other", amount: 80, total: 2950, color: "#64748b" },
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{category.name}</span>
            <span className="font-medium">${category.amount.toFixed(2)}</span>
          </div>
          <Progress
            value={(category.amount / category.total) * 100}
            className="h-2"
            style={{ backgroundColor: `${category.color}20` }} // Light version of the color
          />
        </div>
      ))}
    </div>
  );
}
