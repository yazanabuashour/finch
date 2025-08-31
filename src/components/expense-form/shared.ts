import z from "zod";

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
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
      {
        message: "Enter an amount greater than 0.",
      },
    ),
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
