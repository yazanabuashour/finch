"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TransactionList } from "~/components/transaction-list";

export default function HistoryPage() {
  const [selectedMonth, setSelectedMonth] = useState("june-2023");

  // In a real app, these would be dynamically generated from your data
  const months = [
    { value: "june-2023", label: "June 2023" },
    { value: "may-2023", label: "May 2023" },
    { value: "april-2023", label: "April 2023" },
    { value: "march-2023", label: "March 2023" },
    { value: "february-2023", label: "February 2023" },
    { value: "january-2023", label: "January 2023" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>June 2023</CardTitle>
          <CardDescription>
            View your transactions for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionList filter="all" />
            </TabsContent>
            <TabsContent value="expenses">
              <TransactionList filter="expense" />
            </TabsContent>
            <TabsContent value="income">
              <TransactionList filter="income" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
