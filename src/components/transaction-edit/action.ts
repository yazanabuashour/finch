"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
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
    return { success: false, message: "Please sign in to continue." };
  }

  const parseResult = updateSchema.safeParse(data);
  if (!parseResult.success) {
    console.warn("Update validation failed", parseResult.error.flatten());
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parseResult.error.flatten().fieldErrors,
    } as const;
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      return {
        success: false,
        message: "Could not find your account.",
      } as const;
    }

    const { id, amount, categoryId, transactionDate, ...rest } =
      parseResult.data;
    const categoryIdAsInt = categoryId ? parseInt(categoryId, 10) : null;

    if (!categoryIdAsInt) {
      return { success: false, message: "Please choose a category." } as const;
    }

    // Ensure the transaction belongs to the user
    const [existing] = await db
      .select({ id: transactions.id, userId: transactions.userId })
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!existing || existing.userId !== user.id) {
      return {
        success: false,
        message: "Could not find that transaction.",
      } as const;
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
        message: "Selected category is not available.",
      } as const;
    }

    if (rest.type !== category.type) {
      return {
        success: false,
        message: "Selected category doesn’t match the chosen type.",
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
    console.error("Error while updating transaction:", error);
    return {
      success: false,
      message: "Something went wrong while updating. Please try again.",
    } as const;
  }
}

const bulkUpdateSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
  categoryId: z.number().int().positive(),
});

export type BulkUpdateCategoryInput = z.infer<typeof bulkUpdateSchema>;

export async function bulkUpdateTransactionCategoryAction(
  data: BulkUpdateCategoryInput,
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, message: "Please sign in to continue." } as const;
  }

  const parseResult = bulkUpdateSchema.safeParse(data);
  if (!parseResult.success) {
    console.warn("Bulk update validation failed", parseResult.error.flatten());
    return {
      success: false,
      message: "Please check your selection and try again.",
      errors: parseResult.error.flatten().fieldErrors,
    } as const;
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      return {
        success: false,
        message: "Could not find your account.",
      } as const;
    }

    const { ids, categoryId } = parseResult.data;

    // Validate category belongs to user
    const [category] = await db
      .select({ id: categories.id, type: categories.type })
      .from(categories)
      .where(
        and(eq(categories.id, categoryId), eq(categories.userId, user.id)),
      );

    if (!category) {
      return {
        success: false,
        message: "Selected category is not available.",
      } as const;
    }

    // Fetch selected transactions to ensure ownership and type compatibility
    const txs = await db
      .select({ id: transactions.id, type: categories.type })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(inArray(transactions.id, ids), eq(transactions.userId, user.id)),
      );

    if (txs.length !== ids.length) {
      return {
        success: false,
        message: "Some selected transactions could not be found.",
      } as const;
    }

    // Ensure all selected transactions share the category type
    const hasMismatch = txs.some((t) => t.type !== category.type);
    if (hasMismatch) {
      return {
        success: false,
        message:
          "Selected category type doesn’t match all selected transactions.",
      } as const;
    }

    await db
      .update(transactions)
      .set({ categoryId })
      .where(
        and(inArray(transactions.id, ids), eq(transactions.userId, user.id)),
      );

    revalidatePath("/history");
    revalidatePath("/");

    return {
      success: true,
      message: "Category updated for selected.",
    } as const;
  } catch (error) {
    console.error("Error while bulk-updating transactions:", error);
    return {
      success: false,
      message: "Something went wrong while updating. Please try again.",
    } as const;
  }
}
