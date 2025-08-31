"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "~/components/ui/tabs";

interface ControlledTabsProps {
  initialValue: string;
  children: React.ReactNode;
  paramName?: string; // default: "tab"
}

export function ControlledTabs({
  initialValue,
  children,
  paramName = "tab",
}: ControlledTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlVal = searchParams.get(paramName);
  const [value, setValue] = useState<string>(urlVal ?? initialValue);

  useEffect(() => {
    setValue(urlVal ?? initialValue);
  }, [urlVal, initialValue]);

  const onValueChange = (next: string) => {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      {children}
    </Tabs>
  );
}
