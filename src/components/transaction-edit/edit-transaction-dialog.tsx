"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { validationSchema } from "~/components/expense-form/shared";
import type { HistoryTransaction } from "~/server/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { updateTransactionAction } from "./action";
import { Form } from "~/components/ui/form";
import {
  TransactionFields,
  type FormData as TransactionFormData,
} from "~/components/transaction-form/transaction-fields";
import type { UseFormReturn } from "react-hook-form";

import type { CategoryLite } from "~/components/category-select";

const editSchema = validationSchema.extend({ id: z.number().int().positive() });

type EditFormData = z.infer<typeof editSchema>;

interface EditTransactionDialogProps {
  transaction: HistoryTransaction & { categoryId: number | null };
  categories: CategoryLite[];
  onSuccess?: () => void;
}

export function EditTransactionDialog({
  transaction,
  categories,
  onSuccess,
}: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      id: transaction.id,
      description: transaction.description ?? "",
      amount: String(transaction.amount ?? ""),
      transactionDate: transaction.transactionDate,
      type: transaction.type,
      categoryId: transaction.categoryId
        ? transaction.categoryId.toString()
        : "",
    },
  });

  const onSubmit = async (data: EditFormData) => {
    const result = await updateTransactionAction(data);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      // Allow parent to react (e.g., clear selections)
      try {
        onSuccess?.();
      } catch {
        // no-op
      }
      setOpen(false);
    } else {
      // Apply any server-returned field errors to the form
      if (result.errors && typeof result.errors === "object") {
        for (const [key, messages] of Object.entries(result.errors)) {
          const msg = Array.isArray(messages) ? messages[0] : undefined;
          if (msg) {
            form.setError(key as keyof TransactionFormData, {
              type: "server",
              message: msg,
            });
          }
        }
      }
      toast.error(
        result.message || "Could not update transaction. Please try again.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!form.formState.isSubmitting) setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-xl">
        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the details and save changes.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              aria-busy={form.formState.isSubmitting}
            >
              <TransactionFields
                form={form as unknown as UseFormReturn<TransactionFormData>}
                categories={categories}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={form.formState.isSubmitting}
                  aria-disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  aria-disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
