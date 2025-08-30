"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { PlusCircle, BarChart3, History, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
    <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-6 flex items-center space-x-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Finch
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="mx-6 hidden items-center space-x-4 md:flex lg:space-x-6">
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

        {/* Mobile Navigation */}
        <div className="ml-auto md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Open Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-6 flex flex-col space-y-4">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    asChild
                    variant={route.active ? "default" : "ghost"}
                    className="justify-start text-base font-medium transition-colors"
                    size="sm"
                  >
                    <Link
                      href={route.href}
                      className="flex items-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
