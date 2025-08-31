"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import z from "zod";

import { db } from "~/server/db";
import { users, transactions, categories } from "~/server/db/schema";
import { validationSchema } from "~/components/expense-form/shared";

const updateSchema = validationSchema.extend({
  id: z.number().int().positive(),
});

export type UpdateTransactionInput = z.infer<typeof updateSchema>;

export async function updateTransactionAction(data: UpdateTransactionInput) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, message: "User not authenticated." };
  }

  const parseResult = updateSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      message: "Form validation failed.",
      errors: parseResult.error.flatten().fieldErrors,
    } as const;
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      return { success: false, message: "User not found." } as const;
    }

    const { id, amount, categoryId, transactionDate, ...rest } =
      parseResult.data;
    const categoryIdAsInt = categoryId ? parseInt(categoryId, 10) : null;

    if (!categoryIdAsInt) {
      return { success: false, message: "Category ID is null." } as const;
    }

    // Ensure the transaction belongs to the user
    const [existing] = await db
      .select({ id: transactions.id, userId: transactions.userId })
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!existing || existing.userId !== user.id) {
      return { success: false, message: "Transaction not found." } as const;
    }

    // Validate category belongs to user and matches transaction type rules
    const [category] = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(
        and(eq(categories.id, categoryIdAsInt), eq(categories.userId, user.id)),
      );

    if (!category) {
      return {
        success: false,
        message: "Invalid category selection.",
      } as const;
    }

    if (rest.type !== category.type) {
      return {
        success: false,
        message: "Selected category does not match transaction type.",
      } as const;
    }

    await db
      .update(transactions)
      .set({
        ...rest,
        amount: amount,
        transactionDate: transactionDate,
        categoryId: categoryIdAsInt,
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Transaction updated successfully!",
    } as const;
  } catch (error) {
    console.error("Error during update:", error);
    return {
      success: false,
      message: `An error occurred while updating. ${
        error instanceof Error ? error.message : ""
      }`,
    } as const;
  }
}
