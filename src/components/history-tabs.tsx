"use client";

import { useMemo } from "react";
import { TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ControlledTabs } from "~/components/controlled-tabs";
import { TransactionList } from "~/components/transaction-list";
import type { CategoryLite, TransactionWithCategory } from "~/app/history/page";

interface HistoryTabsProps {
  transactions: (TransactionWithCategory & { categoryId: number })[];
  categories: CategoryLite[];
}

export function HistoryTabs({ transactions, categories }: HistoryTabsProps) {
  // Memoize to avoid recalculating for each tab
  const commonProps = useMemo(
    () => ({ transactions, categories }),
    [transactions, categories],
  );

  return (
    <ControlledTabs initialValue="all" paramName="type">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <TransactionList filter="all" {...commonProps} />
      </TabsContent>
      <TabsContent value="expenses">
        <TransactionList filter="expense" {...commonProps} />
      </TabsContent>
      <TabsContent value="income">
        <TransactionList filter="income" {...commonProps} />
      </TabsContent>
    </ControlledTabs>
  );
}
