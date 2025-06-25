"use server";

import type z from "zod";
import { validationSchema } from "./shared";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users, transactions } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

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

    await db.insert(transactions).values({
      ...rest,
      amount: amount,
      transactionDate: format(transactionDate, "yyyy-MM-dd"),
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
