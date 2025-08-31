import "server-only";
import { db } from "./db";
import { users, transactions } from "./db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { enumerateMonthsUTC, monthKeyUTC } from "./date-utils";

// Shared: available months for a user (YYYY-MM with formatted labels)
export const getAvailableMonths = async (
  clerkUserId: string,
): Promise<{ value: string; label: string }[]> => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    columns: { id: true },
  });
  if (!user) throw new Error("User not found");

  const monthsResult: { month: string }[] = await db.execute(sql`
    SELECT DISTINCT TO_CHAR(${transactions.transactionDate}, 'YYYY-MM') as month
    FROM ${transactions}
    WHERE ${transactions.userId} = ${user.id}
    ORDER BY month DESC
  `);
  return monthsResult
    .map((row) => {
      if (!row.month) return null;
      const [y, m] = row.month.split("-") as [string, string];
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1);
      return {
        value: row.month,
        label: date.toLocaleString("en-US", { month: "long", year: "numeric" }),
      };
    })
    .filter(
      (m): m is { value: string; label: string } =>
        m !== null && m !== undefined,
    );
};

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
    // Use UTC methods to avoid timezone issues
    const monthKey = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    if (!monthlyMap.has(monthKey)) {
      // Create a UTC date for consistent month formatting (with year)
      const utcDate = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
      );
      monthlyMap.set(monthKey, {
        month: utcDate.toLocaleString("default", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
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

// New function: trend over N months, filling empty months with zeros
export const getMonthlyTrendByMonths = async (
  clerkUserId: string,
  months: number,
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // end of current month
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth() - (months - 1),
    1,
  );

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

  // Prefill months in the range with zeros
  const monthsList = enumerateMonthsUTC(
    new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), 1)),
    new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), 1)),
  );
  for (const m of monthsList) {
    const key = monthKeyUTC(m);
    monthlyMap.set(key, {
      month: m.toLocaleString("default", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      income: 0,
      expenses: 0,
    });
  }

  for (const t of userTransactions) {
    const date = t.transactionDate;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const monthData = monthlyMap.get(key);
    if (!monthData) continue;
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
