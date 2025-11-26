"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "~/components/ui/chart";
import { formatCurrency } from "~/lib/utils";

interface OverviewProps {
  data: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export function Overview({ data }: OverviewProps) {
  return (
    <div className="chart-glow rounded-lg">
      <ResponsiveContainer width="100%" height={350} minWidth={1} minHeight={1}>
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 60,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
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
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="var(--destructive)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
