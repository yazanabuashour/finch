"use client";

import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      description: "Grocery Shopping",
      amount: 85.2,
      type: "expense",
      category: "Food",
      date: "2023-06-10",
    },
    {
      id: 2,
      description: "Salary",
      amount: 2500.0,
      type: "income",
      category: "Salary",
      date: "2023-06-05",
    },
    {
      id: 3,
      description: "Internet Bill",
      amount: 65.0,
      type: "expense",
      category: "Utilities",
      date: "2023-06-03",
    },
    {
      id: 4,
      description: "Freelance Work",
      amount: 350.0,
      type: "income",
      category: "Freelance",
      date: "2023-06-02",
    },
    {
      id: 5,
      description: "Restaurant",
      amount: 42.5,
      type: "expense",
      category: "Dining",
      date: "2023-06-01",
    },
  ];

  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-2 ${transaction.type === "expense" ? "bg-red-100" : "bg-green-100"}`}
              >
                {transaction.type === "expense" ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm leading-none font-medium">
                  {transaction.description}
                </p>
                <p className="text-muted-foreground text-sm">
                  {transaction.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{transaction.category}</Badge>
              <span
                className={`font-medium ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}
              >
                {transaction.type === "expense" ? "-" : "+"}$
                {transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
