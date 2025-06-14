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

export function MonthlyTrendChart() {
  // In a real app, this would come from your database
  const data = [
    {
      month: "Jan",
      income: 4000,
      expenses: 2400,
      savings: 1600,
    },
    {
      month: "Feb",
      income: 3000,
      expenses: 1398,
      savings: 1602,
    },
    {
      month: "Mar",
      income: 2000,
      expenses: 3800,
      savings: -1800,
    },
    {
      month: "Apr",
      income: 2780,
      expenses: 3908,
      savings: -1128,
    },
    {
      month: "May",
      income: 1890,
      expenses: 4800,
      savings: -2910,
    },
    {
      month: "Jun",
      income: 2390,
      expenses: 3800,
      savings: -1410,
    },
  ];

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
                return [`$${value}`, undefined];
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
