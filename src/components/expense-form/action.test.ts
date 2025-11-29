import { describe, expect, test } from "bun:test";

import { submitFormAction } from "./action";
import { users, categories } from "~/server/db/schema";

const baseInput = {
  description: "Coffee",
  amount: "12.34",
  transactionDate: new Date("2024-01-02T00:00:00Z"),
  type: "expense" as const,
  categoryId: "42",
};

const createDb = ({
  user,
  category,
  insertSpy,
}: {
  user?: { id: number };
  category?: { id: number; name?: string; type: "expense" | "income" };
  insertSpy?: (payload: unknown) => void;
}) => {
  return {
    select: () => ({
      from: (table: unknown) => ({
        where: async () => {
          if (table === users) {
            return user ? [{ id: user.id }] : [];
          }
          if (table === categories) {
            if (!category) return [];
            return [
              {
                id: category.id,
                name: category.name ?? "Default",
                type: category.type,
              },
            ];
          }
          return [];
        },
      }),
    }),
    insert: () => ({
      values: async (payload: unknown) => {
        insertSpy?.(payload);
      },
    }),
  };
};

describe("submitFormAction", () => {
  test("rejects unauthenticated requests", async () => {
    const result = await submitFormAction(baseInput, {
      auth: async () => ({ userId: null }),
      db: createDb({}),
      revalidatePath: () => {},
    });

    expect(result).toEqual({
      success: false,
      message: "User not authenticated.",
    });
  });

  test("returns an error when the user record is missing", async () => {
    const result = await submitFormAction(baseInput, {
      auth: async () => ({ userId: "user_123" }),
      db: createDb({}),
      revalidatePath: () => {},
    });

    expect(result).toEqual({
      success: false,
      message: "Could not find your account.",
    });
  });

  test("requires numeric category identifiers", async () => {
    const result = await submitFormAction(
      { ...baseInput, categoryId: "abc" },
      {
        auth: async () => ({ userId: "user_123" }),
        db: createDb({ user: { id: 1 } }),
        revalidatePath: () => {},
      },
    );

    expect(result).toEqual({
      success: false,
      message: "Please choose a category.",
    });
  });

  test("validates the category type matches the form type", async () => {
    const result = await submitFormAction(baseInput, {
      auth: async () => ({ userId: "user_123" }),
      db: createDb({
        user: { id: 1 },
        category: { id: 42, type: "income" },
      }),
      revalidatePath: () => {},
    });

    expect(result).toEqual({
      success: false,
      message: "Selected category doesn’t match the chosen type.",
    });
  });

  test("inserts a transaction and revalidates on success", async () => {
    const insertCalls: Array<unknown> = [];
    const insertSpy = (payload: unknown) => {
      insertCalls.push(payload);
    };
    const revalidateCalls: string[] = [];
    const revalidateSpy = (path: string) => {
      revalidateCalls.push(path);
    };

    const result = await submitFormAction(baseInput, {
      auth: async () => ({ userId: "user_123" }),
      db: createDb({
        user: { id: 7 },
        category: { id: 42, type: "expense", name: "Food" },
        insertSpy,
      }),
      revalidatePath: revalidateSpy,
    });

    expect(result).toEqual({
      success: true,
      message: "Transaction added successfully!",
    });
    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0]).toMatchObject({
      description: baseInput.description,
      amount: baseInput.amount,
      userId: 7,
      categoryId: 42,
    });
    expect(revalidateCalls).toEqual(["/", "/dashboard"]);
  });
});
