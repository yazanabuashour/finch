"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Pencil } from "lucide-react";
import { validationSchema } from "~/components/expense-form/shared";
import type { TransactionWithCategory } from "~/app/history/page";
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
import { TransactionFields, type FormData as TransactionFormData } from "~/components/transaction-form/transaction-fields";
import type { UseFormReturn } from "react-hook-form";

export type CategoryLite = { id: number; name: string; type: "expense" | "income" };

const editSchema = validationSchema.extend({ id: z.number().int().positive() });

type EditFormData = z.infer<typeof editSchema>;

interface EditTransactionDialogProps {
  transaction: TransactionWithCategory & { categoryId: number };
  categories: CategoryLite[];
}

export function EditTransactionDialog({ transaction, categories }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      id: transaction.id,
      description: transaction.description ?? "",
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      type: transaction.type,
      categoryId: transaction.categoryId.toString(),
    },
  });

  const onSubmit = async (data: EditFormData) => {
    const result = await updateTransactionAction(data);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      setOpen(false);
    } else {
      toast.error(result.message || "Failed to update transaction.");
      console.error("Update failed:", result);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0">
        <div className="p-5 sm:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the details and save changes.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TransactionFields
                form={form as unknown as UseFormReturn<TransactionFormData>}
                categories={categories}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
