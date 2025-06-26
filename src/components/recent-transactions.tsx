import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import type { Transaction } from "~/server/db/schema";
import { formatDate } from "~/lib/utils";

interface RecentTransactionsProps {
  transactions: (Transaction & { category: { name: string } | null })[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
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
                className={`rounded-full p-2 ${
                  transaction.type === "expense" ? "bg-red-100" : "bg-green-100"
                }`}
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
                  {formatDate(transaction.transactionDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{transaction.category?.name}</Badge>
              <span
                className={`font-medium ${
                  transaction.type === "expense"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {transaction.type === "expense" ? "-" : "+"}$
                {transaction.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
