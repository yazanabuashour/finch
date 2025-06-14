"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { PlusCircle, BarChart3, History, Home } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/expenses",
      label: "Add Expense",
      icon: PlusCircle,
      active: pathname === "/expenses",
    },
    {
      href: "/history",
      label: "History",
      icon: History,
      active: pathname === "/history",
    },
    {
      href: "/trends",
      label: "Trends",
      icon: BarChart3,
      active: pathname === "/trends",
    },
  ];

  return (
    <div className="border-b">
      <div className="container mx-auto flex h-16 items-center">
        <div className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">Finch</span>
        </div>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant={route.active ? "default" : "ghost"}
              className="text-sm font-medium transition-colors"
              size="sm"
            >
              <Link href={route.href} className="flex items-center gap-2">
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
