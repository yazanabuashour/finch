import { and, eq, gte, lte, sql } from "drizzle-orm";
import { endOfMonth, parse, startOfMonth } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { categories, transactions, users } from "~/server/db/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { HistoryTabs } from "~/components/history-tabs";
import { MonthSelector } from "~/components/month-selector";

export type TransactionWithCategory = {
  id: number;
  description: string | null;
  amount: string;
  transactionDate: Date;
  type: "expense" | "income";
  category: {
    name: string;
  } | null;
};

export type CategoryLite = {
  id: number;
  name: string;
  type: "expense" | "income";
};

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
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    columns: { id: true },
  });
  if (!user) {
    return <p className="text-center">User not found.</p>;
  }

  const monthsResult: { month: string }[] = await db.execute(sql`
    SELECT DISTINCT TO_CHAR(${transactions.transactionDate}, 'YYYY-MM') as month
    FROM ${transactions}
    WHERE ${transactions.userId} = ${user.id}
    ORDER BY month DESC
  `);

  const availableMonths = monthsResult
    .map((row) => {
      if (!row.month) return null;
      const [year, month] = row.month.split("-") as [string, string];
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
      return {
        value: row.month,
        label: date.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };
    })
    .filter(
      (m): m is { value: string; label: string } =>
        m !== null && m !== undefined,
    );

  const selectedMonth = searchParams?.month ?? availableMonths[0]?.value;
  const viewAllMonths = selectedMonth === "all";

  let transactionsData: (TransactionWithCategory & { categoryId: number })[] =
    [];
  let userCategories: CategoryLite[] = [];
  if (selectedMonth) {
    if (viewAllMonths) {
      transactionsData = await db
        .select({
          id: transactions.id,
          description: transactions.description,
          amount: transactions.amount,
          transactionDate: transactions.transactionDate,
          type: transactions.type,
          categoryId: transactions.categoryId,
          category: { name: categories.name },
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(eq(transactions.userId, user.id))
        .orderBy(sql`${transactions.transactionDate} DESC`);
    } else {
      const parsedDate = parse(selectedMonth, "yyyy-MM", new Date());

      transactionsData = await db
        .select({
          id: transactions.id,
          description: transactions.description,
          amount: transactions.amount,
          transactionDate: transactions.transactionDate,
          type: transactions.type,
          categoryId: transactions.categoryId,
          category: { name: categories.name },
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.userId, user.id),
            gte(transactions.transactionDate, startOfMonth(parsedDate)),
            lte(transactions.transactionDate, endOfMonth(parsedDate)),
          ),
        )
        .orderBy(sql`${transactions.transactionDate} DESC`);
    }

    userCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(eq(categories.userId, user.id));
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
