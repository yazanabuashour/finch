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
    return {
      success: false,
      message: "Form validation failed.",
      errors: parseResult.error.flatten().fieldErrors,
    };
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      return { success: false, message: "User not found." };
    }

    const { amount, categoryId, transactionDate, ...rest } = parseResult.data;
    const categoryIdAsInt = categoryId ? parseInt(categoryId, 10) : null;

    if (!categoryIdAsInt) {
      return { success: false, message: "Category ID is null." };
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
      return { success: false, message: "Invalid category selection." };
    }

    if (rest.type !== category.type) {
      return {
        success: false,
        message: "Selected category does not match transaction type.",
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
    console.error("Error during saving:", error);
    return {
      success: false,
      message: `An error occurred while saving. ${
        error instanceof Error ? error.message : ""
      }`,
    };
  }
}
