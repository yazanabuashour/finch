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
import { users } from "~/server/db/schema";

export default async function ExpensesPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
    with: {
      categories: true,
    },
  });

  if (!user) {
    return null;
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
