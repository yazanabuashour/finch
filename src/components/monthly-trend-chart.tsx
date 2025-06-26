"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "~/components/ui/chart";

interface MonthlyTrendChartProps {
  data: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value) => {
              if (typeof value === "number") {
                return [`${value}`, undefined];
              }
              return [String(value), undefined];
            }}
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="income"
            stackId="1"
            stroke="#10b981"
            fill="#10b98120"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stackId="2"
            stroke="#ef4444"
            fill="#ef444420"
          />
          <Area
            type="monotone"
            dataKey="savings"
            stackId="3"
            stroke="#3b82f6"
            fill="#3b82f620"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
