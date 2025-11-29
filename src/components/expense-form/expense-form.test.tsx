import "../../test/setup-dom";

import { describe, expect, mock, test } from "bun:test";
import type { UseFormReturn } from "react-hook-form";

import type { ExpenseFormData } from "./shared";
import type { CategoryLite } from "~/components/category-select";
import type { DescriptionSuggestion } from "~/lib/utils";

mock.module("sonner", () => ({
  toast: {
    success: () => {},
    error: () => {},
  },
}));

const { render, screen, waitFor } = await import("@testing-library/react");
const { default: userEvent } = await import("@testing-library/user-event");
const { ExpenseForm } = await import("./expense-form");

type StubFieldsProps = {
  form: UseFormReturn<ExpenseFormData>;
  categories: CategoryLite[];
  descriptionSuggestions: DescriptionSuggestion[];
};

const StubTransactionFields = ({
  form,
  categories,
}: StubFieldsProps) => {
  const { register, formState } = form;
  const amountError = formState.errors.amount?.message;

  return (
    <div>
      <label>
        Description
        <input aria-label="Description" {...register("description")} />
      </label>
      <label>
        Amount
        <input aria-label="Amount" {...register("amount")} />
      </label>
      <label>
        Category
        <select aria-label="Category" {...register("categoryId")}>
          <option value="">Select</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      {amountError ? <p role="alert">{amountError}</p> : null}
    </div>
  );
};

const categories: CategoryLite[] = [
  { id: 1, name: "Food", type: "expense" },
  { id: 2, name: "Salary", type: "income" },
];

describe("ExpenseForm", () => {
  test("submits normalized form data and resets inputs on success", async () => {
    const user = userEvent.setup();
    const submitCalls: ExpenseFormData[] = [];
    const submitAction = async (data: ExpenseFormData) => {
      submitCalls.push(data);
      return {
        success: true,
        message: "ok",
      } as const;
    };

    render(
      <ExpenseForm
        categories={categories}
        descriptionSuggestions={[]}
        submitAction={submitAction}
        fieldsComponent={StubTransactionFields}
      />,
    );

    await user.type(screen.getByLabelText("Description"), "Lunch run");
    await user.type(screen.getByLabelText("Amount"), " $1,234.5 ");
    await user.selectOptions(screen.getByLabelText("Category"), "1");
    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    await waitFor(() => expect(submitCalls.length).toBe(1));
    expect(submitCalls[0]).toMatchObject({
      amount: "1234.50",
      categoryId: "1",
    });

    await waitFor(() => {
      const descriptionInput = screen.getByLabelText(
        "Description",
      ) as HTMLInputElement;
      expect(descriptionInput.value).toBe("");
    });
    const amountInput = screen.getByLabelText("Amount") as HTMLInputElement;
    expect(amountInput.value).toBe("");
  });

  test("surfaces server-side field errors from the action response", async () => {
    const user = userEvent.setup();
    const submitAction = async () => ({
      success: false,
      message: "nope",
      errors: { amount: ["Too big"] },
    });

    render(
      <ExpenseForm
        categories={categories}
        descriptionSuggestions={[]}
        submitAction={submitAction}
        fieldsComponent={StubTransactionFields}
      />,
    );

    await user.type(screen.getByLabelText("Description"), "Groceries");
    await user.type(screen.getByLabelText("Amount"), "400");
    await user.selectOptions(screen.getByLabelText("Category"), "1");
    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Too big");
  });
});
