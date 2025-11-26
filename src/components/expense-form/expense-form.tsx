"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { CategoryLite } from "~/components/category-select";
import type { DescriptionSuggestion } from "~/lib/utils";
import { submitFormAction } from "./action";
import { validationSchema } from "./shared";
import type z from "zod";
import { Form } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { TransactionFields } from "~/components/transaction-form/transaction-fields";

interface ExpenseFormProps {
  categories: CategoryLite[];
  descriptionSuggestions: DescriptionSuggestion[];
}

type FormData = z.infer<typeof validationSchema>;

export function ExpenseForm({
  categories,
  descriptionSuggestions,
}: ExpenseFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      description: "",
      amount: "",
      transactionDate: new Date(),
      type: "expense",
      categoryId: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const result = await submitFormAction(data);

    if (result.success) {
      toast.success(result.message);
      const currentType = form.getValues("type");
      form.reset({
        description: "",
        amount: "",
        transactionDate: new Date(),
        type: currentType,
        categoryId:
          currentType === "income" ? form.getValues("categoryId") : "",
      });
    } else {
      // Surface server-side field errors inline when available
      if (result.errors && typeof result.errors === "object") {
        for (const [key, messages] of Object.entries(result.errors)) {
          const msg = Array.isArray(messages) ? messages[0] : undefined;
          if (msg) {
            form.setError(key as keyof FormData, {
              type: "server",
              message: msg,
            });
          }
        }
      }
      toast.error(
        result.message ||
          "Could not add transaction. Please check the form and try again.",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TransactionFields
          form={form}
          categories={categories}
          descriptionSuggestions={descriptionSuggestions}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
          aria-disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Adding...
            </>
          ) : (
            "Add Transaction"
          )}
        </Button>
      </form>
    </Form>
  );
}
