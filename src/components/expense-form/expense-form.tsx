"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import type { Category } from "~/server/db/schema";
import { submitFormAction } from "./action";
import { validationSchema } from "./shared";
import type z from "zod";

interface ExpenseFormProps {
  categories: Category[];
}

type FormData = z.infer<typeof validationSchema>;

export function ExpenseForm({ categories }: ExpenseFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      description: "",
      amount: "",
      transactionDate: new Date(),
      type: "expense",
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
      toast.error(result.message || "An error occurred.");
      console.error("Form submission failed:", result.errors);
    }
  };

  const transactionType = form.watch("type");

  const incomeCategory = useMemo(
    () => categories.find((category) => category.name === "Income"),
    [categories],
  );

  useEffect(() => {
    if (transactionType === "income") {
      if (incomeCategory) {
        form.setValue("categoryId", incomeCategory.id.toString(), {
          shouldValidate: true,
        });
      } else {
        toast.error("Income category not found. Please create it.");
      }
    } else {
      // When switching back to expense, clear Income selection if set
      const currentCategory = form.getValues("categoryId");
      if (incomeCategory && currentCategory === incomeCategory.id.toString()) {
        form.setValue("categoryId", "", { shouldValidate: true });
      }
    }
  }, [transactionType, form, incomeCategory]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
                    <Input placeholder="0.00" className="pl-7" {...field} />
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={transactionType === "income"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories
                    .filter((c) =>
                      transactionType === "expense" ? c.name !== "Income" : true,
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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

        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>
    </Form>
  );
}
