"use server";

import type z from "zod";
import { validationSchema } from "./shared";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, transactions, categories } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitFormAction(data: z.infer<typeof validationSchema>) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, message: "User not authenticated." };
  }

  const parseResult = validationSchema.safeParse(data);
  if (!parseResult.success) {
    // Log details server-side; return a user-friendly message
    console.warn("Expense form validation failed", parseResult.error.flatten());
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parseResult.error.flatten().fieldErrors,
    };
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      return { success: false, message: "Could not find your account." };
    }

    const { amount, categoryId, transactionDate, ...rest } = parseResult.data;
    const categoryIdAsInt = categoryId ? parseInt(categoryId, 10) : null;

    if (!categoryIdAsInt) {
      return { success: false, message: "Please choose a category." };
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
      return { success: false, message: "Selected category is not available." };
    }

    if (rest.type !== category.type) {
      return {
        success: false,
        message: "Selected category doesn’t match the chosen type.",
      };
    }

    await db.insert(transactions).values({
      ...rest,
      amount: amount,
      transactionDate: transactionDate,
      userId: user.id,
      categoryId: categoryIdAsInt,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { success: true, message: "Transaction added successfully!" };
  } catch (error) {
    console.error("Error while saving transaction:", error);
    return {
      success: false,
      message: "Something went wrong while saving. Please try again.",
    };
  }
}
