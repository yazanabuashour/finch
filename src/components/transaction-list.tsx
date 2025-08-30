"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { TransactionWithCategory } from "~/app/history/page";
import { formatCurrency, formatDate } from "~/lib/utils";

interface TransactionListProps {
  filter: "all" | "expense" | "income";
  transactions: TransactionWithCategory[];
}

export function TransactionList({
  filter,
  transactions,
}: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filter === "all") return true;
      return transaction.type === filter;
    })
    .filter((transaction) => {
      if (!searchQuery) return true;
      const descriptionMatch =
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false;
      const categoryMatch =
        transaction.category?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false;
      return descriptionMatch || categoryMatch;
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
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="w-[180px]">Category</TableHead>
              <TableHead className="text-right w-[140px]">Amount</TableHead>
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
                  <TableCell>
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate sm:max-w-[28rem]">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.category?.name ?? "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "expense" ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatCurrency(Number(transaction.amount))}
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
