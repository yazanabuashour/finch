import { auth } from "@clerk/nextjs/server";
import { ExpenseForm } from "~/components/expense-form/expense-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ensureIncomeCategory,
  getDescriptionSuggestions,
} from "~/server/queries";

export default async function ExpensesPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const categories = await ensureIncomeCategory(userId);
  const descriptionSuggestions = await getDescriptionSuggestions(userId);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
          <CardDescription>Record a new expense or income</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            categories={categories}
            descriptionSuggestions={descriptionSuggestions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
