"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "~/components/ui/chart";

interface CategoryChartProps {
  data: {
    name: string;
    amount: number;
    total: number;
  }[];
}

import { useMemo } from "react";

const FALLBACK_COLORS = [
  "#10b981", // primary-like
  "#06b6d4", // chart-2
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#3b82f6", // blue
];

export function CategoryChart({ data }: CategoryChartProps) {
  const palette = useMemo(() => {
    if (typeof window === "undefined") return FALLBACK_COLORS;
    const style = getComputedStyle(document.documentElement);
    const vars = [
      style.getPropertyValue("--chart-1").trim(),
      style.getPropertyValue("--chart-2").trim(),
      style.getPropertyValue("--chart-3").trim(),
      style.getPropertyValue("--chart-4").trim(),
      style.getPropertyValue("--chart-5").trim(),
    ].filter(Boolean);
    return vars.length ? vars : FALLBACK_COLORS;
  }, []);

  const chartData = data.map((d, index) => ({
    name: d.name,
    value: d.amount,
    color: palette[index % palette.length],
  }));

  return (
    <div className="chart-glow h-[350px] w-full rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={false}
            label={({ name, percent }) => {
              if (percent === undefined) return "";
              return `${name} ${(percent * 100).toFixed(0)}%`;
            }}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              if (typeof value === "number") {
                return [`${value.toFixed(2)}`, "Amount"];
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
