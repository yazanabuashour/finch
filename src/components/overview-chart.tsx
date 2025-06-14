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

export function Overview() {
  // In a real app, this would come from your database
  const data = [
    {
      name: "Jan",
      income: 4000,
      expenses: 2400,
    },
    {
      name: "Feb",
      income: 3000,
      expenses: 1398,
    },
    {
      name: "Mar",
      income: 2000,
      expenses: 3800,
    },
    {
      name: "Apr",
      income: 2780,
      expenses: 3908,
    },
    {
      name: "May",
      income: 1890,
      expenses: 4800,
    },
    {
      name: "Jun",
      income: 2390,
      expenses: 3800,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar
          dataKey="income"
          name="Income"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
