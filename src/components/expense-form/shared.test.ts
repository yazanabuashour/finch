import { describe, expect, test } from "bun:test";

import { normalizeAmount, validationSchema } from "./shared";

const validInput = {
  description: "Coffee",
  amount: "12.34",
  transactionDate: new Date("2024-01-01T00:00:00Z"),
  type: "expense" as const,
  categoryId: "cat-123",
};

describe("normalizeAmount", () => {
  test("strips currency symbols and thousands separators", () => {
    expect(normalizeAmount(" $1,234.5 ")).toBe("1234.50");
  });

  test("treats commas as decimal separators when no dot exists", () => {
    expect(normalizeAmount("19,8")).toBe("19.80");
  });

  test("removes negative signs and preserves precision", () => {
    expect(normalizeAmount("-45.6")).toBe("45.60");
  });
});

describe("validationSchema failure cases", () => {
  test("rejects blank amount input", () => {
    const result = validationSchema.safeParse({ ...validInput, amount: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.amount).toContain(
        "Enter an amount.",
      );
    }
  });

  test("rejects zero or negative amounts", () => {
    const result = validationSchema.safeParse({ ...validInput, amount: "0" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.amount).toContain(
        "Enter an amount greater than 0.",
      );
    }
  });

  test("surfaces the custom missing date error message", () => {
    const result = validationSchema.safeParse({
      ...validInput,
      transactionDate: undefined as unknown as Date,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.transactionDate).toContain(
        "Please select a date.",
      );
    }
  });

  test("surfaces the custom missing type error message", () => {
    const result = validationSchema.safeParse({
      ...validInput,
      type: undefined as unknown as "expense",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.type).toContain(
        "Please select a transaction type.",
      );
    }
  });
});
