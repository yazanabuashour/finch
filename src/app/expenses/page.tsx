import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { ExpenseForm } from "~/components/expense-form/expense-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { db } from "~/server/db";
import { users, categories as categoriesTable } from "~/server/db/schema";

export default async function ExpensesPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  let user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
    with: {
      categories: true,
    },
  });

  if (!user) {
    return null;
  }
  // Ensure each user has a single Income category
  const existingIncomeByType = user.categories.find((c) => c.type === "income");
  const existingIncomeByName = user.categories.find((c) => c.name === "Income");
  if (!existingIncomeByType) {
    if (existingIncomeByName) {
      // Backfill: update existing "Income" category to income type
      await db
        .update(categoriesTable)
        .set({ type: "income" })
        .where(eq(categoriesTable.id, existingIncomeByName.id));
      user = {
        ...user,
        categories: user.categories.map((c) =>
          c.id === existingIncomeByName.id ? { ...c, type: "income" } : c,
        ),
      } as typeof user;
    } else {
      const [created] = await db
        .insert(categoriesTable)
        .values({ name: "Income", type: "income", userId: user.id })
        .returning();
      if (created) {
        user = {
          ...user,
          categories: [...user.categories, created],
        } as typeof user;
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
          <CardDescription>Record a new expense or income</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm categories={user.categories} />
        </CardContent>
      </Card>
    </div>
  );
}
