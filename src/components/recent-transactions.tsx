"use client";

import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";

export function RecentTransactions() {
  // In a real app, this would come from your database
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
              <Avatar
                className={
                  transaction.type === "expense" ? "bg-red-100" : "bg-green-100"
                }
              >
                <span
                  className={
                    transaction.type === "expense"
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {transaction.type === "expense" ? "-" : "+"}
                </span>
              </Avatar>
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
