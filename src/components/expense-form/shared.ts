import z from "zod";

function normalizeAmount(input: string) {
  const raw = input.trim();
  let s = raw.replace(/[^0-9.,-]/g, "");
  // Disallow negative amounts; strip minus signs entirely
  s = s.replace(/-/g, "");
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && !hasDot) {
    s = s.replace(/,/g, ".");
  } else if (hasComma && hasDot) {
    s = s.replace(/,/g, "");
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n.toFixed(2) : s;
}

export const validationSchema = z.object({
  description: z.string().max(255, {
    message: "Keep description under 255 characters.",
  }),
  amount: z
    .string()
    .transform((s) => s.trim())
    .refine((val) => val.length > 0, {
      message: "Enter an amount.",
    })
    .refine((val) => {
      const normalized = normalizeAmount(val);
      const num = Number.parseFloat(normalized);
      return !isNaN(num) && num > 0;
    }, {
      message: "Enter an amount greater than 0.",
    })
    .transform((val) => normalizeAmount(val)),
  transactionDate: z.date({
    error: (issue) => {
      if (issue.input === undefined) {
        return { message: "Please select a date." };
      }
      return { message: "Invalid date." };
    },
  }),
  type: z.enum(["expense", "income"], {
    error: (issue) => {
      if (issue.input === undefined) {
        return { message: "Please select a transaction type." };
      }
      return { message: "Invalid transaction type." };
    },
  }),
  categoryId: z.string().min(1, { message: "Please choose a category." }),
});

export type ExpenseFormData = z.infer<typeof validationSchema>;
