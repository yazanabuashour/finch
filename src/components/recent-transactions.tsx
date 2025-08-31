import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import type { Transaction } from "~/server/db/schema";
import { formatCurrency, formatDate } from "~/lib/utils";

interface RecentTransactionsProps {
  transactions: (Transaction & {
    category: { name: string; type: "expense" | "income" } | null;
  })[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className={`rounded-full p-2 ${
                  transaction.category?.type === "expense"
                    ? "bg-red-100"
                    : "bg-green-100"
                }`}
              >
                {transaction.category?.type === "expense" ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="max-w-[12rem] truncate text-sm leading-none font-medium sm:max-w-[18rem] lg:max-w-[14rem]">
                  {transaction.description}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(transaction.transactionDate)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap sm:self-auto">
              <Badge variant="outline">{transaction.category?.name}</Badge>
              <span
                className={`font-medium tabular-nums ${
                  transaction.category?.type === "expense"
                    ? "text-destructive"
                    : "text-primary"
                }`}
              >
                {transaction.category?.type === "expense" ? "-" : "+"}
                {formatCurrency(Number(transaction.amount))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
