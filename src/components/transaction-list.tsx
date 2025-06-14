"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

interface TransactionListProps {
  filter: "all" | "expense" | "income";
}

export function TransactionList({ filter }: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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
    {
      id: 6,
      description: "Gas",
      amount: 35.75,
      type: "expense",
      category: "Transportation",
      date: "2023-06-08",
    },
    {
      id: 7,
      description: "Movie Tickets",
      amount: 24.0,
      type: "expense",
      category: "Entertainment",
      date: "2023-06-12",
    },
    {
      id: 8,
      description: "Dividend Payment",
      amount: 120.5,
      type: "income",
      category: "Investments",
      date: "2023-06-15",
    },
  ];

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filter === "all") return true;
      return transaction.type === filter;
    })
    .filter((transaction) => {
      if (!searchQuery) return true;
      return (
        transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          placeholder="Search transactions..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-8 text-center"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "expense"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"}$
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
