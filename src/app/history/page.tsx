import { auth } from "@clerk/nextjs/server";
import {
  getAvailableMonths,
  getHistoryTransactions,
  getUserCategoriesLite,
} from "~/server/queries";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { HistoryTabs } from "~/components/history-tabs";
import { MonthSelector } from "~/components/month-selector";
import type { CategoryLite, HistoryTransaction } from "~/server/queries";

export default async function HistoryPage(props: {
  searchParams?: Promise<{
    month?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return <p className="text-center">Please sign in to view your history.</p>;
  }

  const availableMonths = await getAvailableMonths(clerkUserId);

  const selectedMonth = searchParams?.month ?? availableMonths[0]?.value;
  const viewAllMonths = selectedMonth === "all";

  let transactionsData: (HistoryTransaction & { categoryId: number | null })[] =
    [];
  let userCategories: CategoryLite[] = [];
  if (selectedMonth) {
    transactionsData = await getHistoryTransactions(
      clerkUserId,
      viewAllMonths ? "all" : selectedMonth,
    );
    userCategories = await getUserCategoriesLite(clerkUserId);
  }

  const selectedMonthLabel = viewAllMonths
    ? "All Transactions"
    : (availableMonths.find((m) => m.value === selectedMonth)?.label ??
      "Transaction History");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-gradient text-2xl font-bold">
          Transaction History
        </h1>
        <MonthSelector months={availableMonths} selectedMonth={selectedMonth} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedMonthLabel}</CardTitle>
          <CardDescription>
            {viewAllMonths
              ? "View your transactions across all months."
              : "View your transactions for this month."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsData.length > 0 ? (
            <HistoryTabs
              transactions={transactionsData}
              categories={userCategories}
            />
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              No transactions found for this period.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
