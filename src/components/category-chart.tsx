"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "~/components/ui/chart";

export function CategoryChart() {
  // In a real app, this would come from your database
  const data = [
    { name: "Food", value: 850, color: "#10b981" },
    { name: "Housing", value: 1200, color: "#3b82f6" },
    { name: "Transportation", value: 350, color: "#6366f1" },
    { name: "Utilities", value: 200, color: "#8b5cf6" },
    { name: "Entertainment", value: 150, color: "#ec4899" },
    { name: "Healthcare", value: 120, color: "#f43f5e" },
    { name: "Other", value: 80, color: "#64748b" },
  ];

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              if (typeof value === "number") {
                return [`$${value.toFixed(2)}`, "Amount"];
              }
              return [value, "Amount"];
            }}
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
