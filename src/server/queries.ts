import "server-only";
import { db } from "./db";
import { users, transactions } from "./db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const getTransactions = async (
  clerkUserId: string,
  from?: Date,
  to?: Date,
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const whereConditions = [eq(transactions.userId, user.id)];
  if (from) {
    whereConditions.push(gte(transactions.transactionDate, from));
  }
  if (to) {
    whereConditions.push(lte(transactions.transactionDate, to));
  }

  return db.query.transactions.findMany({
    where: and(...whereConditions),
    with: {
      category: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.transactionDate)],
  });
};

export const getMonthSummary = async (
  clerkUserId: string,
  year: number,
  month: number,
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, user.id),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate),
    ),
  });

  const summary = monthTransactions.reduce(
    (acc, t) => {
      if (t.type === "income") {
        acc.totalIncome += Number(t.amount);
      } else {
        acc.totalSpending += Number(t.amount);
      }
      return acc;
    },
    { totalIncome: 0, totalSpending: 0 },
  );

  return {
    totalIncome: summary.totalIncome,
    totalSpending: summary.totalSpending,
    netSavings: summary.totalIncome - summary.totalSpending,
  };
};

// New function to calculate total cash
export const getTotalCash = async (clerkUserId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const result = await db
    .select({
      totalIncome:
        sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(
          Number,
        ),
      totalExpenses:
        sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(
          Number,
        ),
    })
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  const { totalIncome, totalExpenses } = result[0] ?? {
    totalIncome: 0,
    totalExpenses: 0,
  };
  return totalIncome - totalExpenses;
};

export const getCategoryBreakdown = async (
  clerkUserId: string,
  year: number,
  month: number,
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, user.id),
      eq(transactions.type, "expense"),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate),
    ),
    with: {
      category: true,
    },
  });

  const totalSpending =
    monthTransactions.reduce((acc, t) => acc + Number(t.amount), 0) ?? 0;

  const categoryMap = monthTransactions.reduce(
    (acc, t) => {
      const categoryName = t.category?.name ?? "Uncategorized";
      acc[categoryName] ??= { name: categoryName, amount: 0 };
      acc[categoryName].amount += Number(t.amount);
      return acc;
    },
    {} as Record<string, { name: string; amount: number }>,
  );

  return Object.values(categoryMap).map((c) => ({
    ...c,
    total: totalSpending,
  }));
};

export const getMonthlyTrend = async (
  clerkUserId: string,
  from?: Date,
  to?: Date,
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth() - 5, 1); // 6 months ago

  const startDate = from ?? defaultFrom;
  const endDate = to ?? today;

  const userTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, user.id),
      gte(transactions.transactionDate, startDate),
      lte(transactions.transactionDate, endDate),
    ),
    orderBy: (transactions, { asc }) => [asc(transactions.transactionDate)],
  });

  const monthlyMap = new Map<
    string,
    { month: string; income: number; expenses: number }
  >();

  for (const t of userTransactions) {
    const date = t.transactionDate;
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: date.toLocaleString("default", { month: "short" }),
        income: 0,
        expenses: 0,
      });
    }

    const monthData = monthlyMap.get(monthKey)!;
    if (t.type === "income") {
      monthData.income += Number(t.amount);
    } else {
      monthData.expenses += Number(t.amount);
    }
  }

  const sortedKeys = Array.from(monthlyMap.keys()).sort();

  return sortedKeys.map((key) => {
    const data = monthlyMap.get(key)!;
    return {
      ...data,
      savings: data.income - data.expenses,
    };
  });
};
