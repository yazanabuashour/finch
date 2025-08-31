"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export type CategoryLite = {
  id: number;
  name: string;
  type: "expense" | "income";
};

interface CategorySelectProps {
  categories: CategoryLite[];
  value?: string;
  onChange: (value: string) => void;
  filter?: "all" | "expense" | "income";
  placeholder?: string;
  triggerClassName?: string;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  filter = "all",
  placeholder = "Select a category",
  triggerClassName,
}: CategorySelectProps) {
  const items = categories
    .filter((c) => (filter === "all" ? true : c.type === filter))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
