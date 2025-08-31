"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TransactionList } from "~/components/transaction-list";
import type { CategoryLite, TransactionWithCategory } from "~/app/history/page";

interface HistoryTabsProps {
  transactions: (TransactionWithCategory & { categoryId: number })[];
  categories: CategoryLite[];
}

export function HistoryTabs({ transactions, categories }: HistoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentType = (searchParams.get("type") ?? "all") as
    | "all"
    | "expenses"
    | "income";

  const onTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Memoize to avoid recalculating for each tab
  const commonProps = useMemo(
    () => ({ transactions, categories }),
    [transactions, categories],
  );

  return (
    <Tabs value={currentType} onValueChange={onTypeChange} className="w-full">
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
    </Tabs>
  );
}
