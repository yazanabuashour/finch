"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export interface QuerySelectOption {
  value: string;
  label: string;
}

interface QuerySelectProps {
  param: string;
  options: QuerySelectOption[];
  value?: string;
  placeholder?: string;
  extraParams?: Record<string, string | undefined>;
  triggerClassName?: string;
  size?: "sm" | "default";
  clearParams?: string[];
}

export function QuerySelect({
  param,
  options,
  value,
  placeholder,
  extraParams,
  triggerClassName,
  size,
  clearParams,
}: QuerySelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChange = (v: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(param, v);
      if (clearParams?.length) {
        for (const k of clearParams) {
          params.delete(k);
        }
      }
      if (extraParams) {
        for (const [k, val] of Object.entries(extraParams)) {
          if (val === undefined || val === null) continue;
          params.set(k, String(val));
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Select value={value} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger
        className={triggerClassName}
        size={size}
        disabled={isPending}
        aria-busy={isPending}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
