"use server";

import type z from "zod";
import { validationSchema } from "./shared";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, transactions, categories } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type DbSelectBuilder = {
  from: (...args: unknown[]) => {
    where: (...args: unknown[]) => Promise<unknown[]>;
  };
};

type DbInsertBuilder = {
  values: (...args: unknown[]) => Promise<unknown>;
};

type DbLike = {
  select: (...args: unknown[]) => DbSelectBuilder;
  insert: (...args: unknown[]) => DbInsertBuilder;
};

type SubmitFormDeps = {
  auth: typeof auth;
  db: DbLike;
  revalidatePath: typeof revalidatePath;
};

const defaultDeps: SubmitFormDeps = {
  auth,
  db,
  revalidatePath,
};

export async function submitFormAction(
  data: z.infer<typeof validationSchema>,
  deps: SubmitFormDeps = defaultDeps,
) {
  const { auth: authFn, db: dbClient, revalidatePath: revalidate } = deps;

  const { userId: clerkUserId } = await authFn();
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
    const [user] = await dbClient
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!user) {
      return { success: false, message: "Could not find your account." };
    }

    const { amount, categoryId, transactionDate, type, description } =
      parseResult.data;
    const categoryIdAsInt = categoryId ? parseInt(categoryId, 10) : null;

    if (!categoryIdAsInt) {
      return { success: false, message: "Please choose a category." };
    }

    // Validate category belongs to user and matches transaction type rules
    const [category] = await dbClient
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

    if (type !== category.type) {
      return {
        success: false,
        message: "Selected category doesn’t match the chosen type.",
      };
    }

    await dbClient.insert(transactions).values({
      description,
      amount: amount,
      transactionDate: transactionDate,
      userId: user.id,
      categoryId: categoryIdAsInt,
    });

    revalidate("/");
    revalidate("/dashboard");

    return { success: true, message: "Transaction added successfully!" };
  } catch (error) {
    console.error("Error while saving transaction:", error);
    return {
      success: false,
      message: "Something went wrong while saving. Please try again.",
    };
  }
}
