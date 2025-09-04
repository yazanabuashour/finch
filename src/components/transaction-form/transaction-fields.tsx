"use client";

import { useEffect, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { CategorySelect } from "~/components/category-select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { ExpenseFormData } from "~/components/expense-form/shared";

export type FormData = ExpenseFormData;

export type CategoryLite = {
  id: number;
  name: string;
  type: "expense" | "income";
};

interface TransactionFieldsProps {
  form: UseFormReturn<FormData>;
  categories: CategoryLite[];
}

export function TransactionFields({
  form,
  categories,
}: TransactionFieldsProps) {
  // Use useWatch to ensure reactive updates on radio change
  const transactionType = useWatch({ control: form.control, name: "type" });

  const incomeCategory = useMemo(
    () => categories.find((category) => category.type === "income"),
    [categories],
  );

  useEffect(() => {
    if (transactionType === "income") {
      if (incomeCategory) {
        const values = form.getValues();
        form.reset(
          { ...values, categoryId: incomeCategory.id.toString() },
          { keepDefaultValues: true, keepDirty: true, keepTouched: true },
        );
      }
    } else {
      const currentCategory = form.getValues().categoryId;
      if (incomeCategory && currentCategory === incomeCategory.id.toString()) {
        const values = form.getValues();
        form.reset(
          { ...values, categoryId: "" },
          { keepDefaultValues: true, keepDirty: true, keepTouched: true },
        );
      }
    }
  }, [transactionType, form, incomeCategory]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Transaction Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex space-x-4"
              >
                <FormItem className="flex items-center space-y-0 space-x-2">
                  <FormControl>
                    <RadioGroupItem value="expense" />
                  </FormControl>
                  <FormLabel className="font-normal">Expense</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-y-0 space-x-2">
                  <FormControl>
                    <RadioGroupItem value="income" />
                  </FormControl>
                  <FormLabel className="font-normal">Income</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="text-muted-foreground absolute inset-y-0 left-0 flex items-center pl-3">
                    $
                  </span>
                  <Input
                    placeholder="0.00"
                    className="pl-7"
                    inputMode="decimal"
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const ungrouped = val.replace(/,/g, "");
                        if (ungrouped !== val) field.onChange(ungrouped);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Block comma from being entered
                      if (e.key === "," || e.key === "-") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Sanitize input: remove commas and non numeric (keep one dot)
                      let s = raw.replace(/,/g, "").replace(/-/g, "").replace(/[^0-9.]/g, "");
                      // Ensure only a single decimal point
                      const firstDot = s.indexOf(".");
                      if (firstDot !== -1) {
                        s =
                          s.slice(0, firstDot + 1) +
                          s.slice(firstDot + 1).replace(/\./g, "");
                      }
                      field.onChange(s);
                    }}
                    onBlur={(e) => {
                      // Preserve RHF touched state
                      field.onBlur();
                      const raw = e.target.value.trim();
                      if (raw === "") return;
                      const normalized = raw.replace(/,/g, "");
                      const num = Number.parseFloat(normalized);
                      if (!Number.isFinite(num)) return;
                      field.onChange(formatter.format(num));
                    }}
                    value={field.value}
                    name={field.name}
                    ref={field.ref}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            {transactionType === "income" ? (
              <div className="text-sm">
                <div className="text-muted-foreground mb-1">
                  Income category is auto-selected
                </div>
                <div className="bg-muted/30 rounded-md border px-3 py-2">
                  {incomeCategory ? incomeCategory.name : "Income"}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Categories are used for expenses. Income uses a single
                  category.
                </p>
              </div>
            ) : (
              <CategorySelect
                categories={categories}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  void form.trigger();
                }}
                filter="expense"
              />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter a description for this transaction"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
