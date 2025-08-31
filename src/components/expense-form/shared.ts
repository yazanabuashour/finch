import z from "zod";

export const validationSchema = z.object({
  description: z.string().max(255, {
    message: "Description must not be more than 255 characters.",
  }),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
      {
        message: "Amount must be a positive number.",
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
  categoryId: z.string().min(1, { message: "Category is required." }),
});

export type ExpenseFormData = z.infer<typeof validationSchema>;
