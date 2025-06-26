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
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 60,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value) => {
              if (typeof value === "number") {
                return [formatCurrency(value), undefined];
              }
              return [String(value), undefined];
            }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#1f2937",
              color: "#f9fafb",
            }}
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
