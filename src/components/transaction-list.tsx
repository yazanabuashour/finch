"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import { Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { HistoryTransaction, CategoryLite } from "~/server/queries";
import { formatCurrency, formatDate } from "~/lib/utils";
import { EditTransactionDialog } from "~/components/transaction-edit/edit-transaction-dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CategorySelect } from "~/components/category-select";
import { bulkUpdateTransactionCategoryAction } from "~/components/transaction-edit/action";

interface TransactionListProps {
  filter: "all" | "expense" | "income";
  transactions: (HistoryTransaction & { categoryId: number | null })[];
  categories: CategoryLite[];
}

export function TransactionList({
  filter,
  transactions,
  categories,
}: TransactionListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("q") ?? "";
  const selectedParam = searchParams.get("selected") ?? "";
  const bulkCatParam = searchParams.get("bulkCat") ?? "";

  const selectedSet = useMemo(() => {
    return new Set(
      selectedParam
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n) && n > 0),
    );
  }, [selectedParam]);

  const setParams = (updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      if (filter === "all") return true;
      return transaction.type === filter;
    })
    .filter((transaction) => {
      if (!searchQuery) return true;
      const descriptionMatch =
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false;
      const categoryMatch =
        transaction.category?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false;
      return descriptionMatch || categoryMatch;
    });

  const visibleIds = useMemo(
    () => filteredTransactions.map((t) => t.id),
    [filteredTransactions],
  );

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
  const someVisibleSelected = visibleIds.some((id) => selectedSet.has(id));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (id: number) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setParams((p) => {
      if (next.size === 0) p.delete("selected");
      else p.set("selected", Array.from(next).join(","));
    });
  };

  const selectVisible = () => {
    const next = new Set(selectedSet);
    visibleIds.forEach((id) => next.add(id));
    setParams((p) => p.set("selected", Array.from(next).join(",")));
  };

  const deselectVisible = () => {
    const next = new Set(selectedSet);
    visibleIds.forEach((id) => next.delete(id));
    setParams((p) => {
      if (next.size === 0) p.delete("selected");
      else p.set("selected", Array.from(next).join(","));
    });
  };

  // Removed unused selectAllLoaded helper to satisfy lint

  // Helper to clear selection is no longer exposed via UI, but retain inline usage after bulk apply.
  const clearSelectionInternal = () => setParams((p) => p.delete("selected"));

  const setSearch = (value: string) =>
    setParams((p) => {
      if (value) p.set("q", value);
      else p.delete("q");
    });

  const setBulkCat = (value: string) =>
    setParams((p) => {
      if (value) p.set("bulkCat", value);
      else p.delete("bulkCat");
    });

  const applyBulkCategory = async () => {
    const ids = Array.from(selectedSet);
    if (ids.length === 0) {
      toast.error("No rows selected.");
      return;
    }
    const catId = parseInt(bulkCatParam, 10);
    if (!Number.isFinite(catId)) {
      toast.error("Select a category to apply.");
      return;
    }

    const selectedTypes = new Set(
      transactions.filter((t) => selectedSet.has(t.id)).map((t) => t.type),
    );
    if (selectedTypes.size > 1) {
      toast.error(
        "Selection contains both income and expenses. Narrow your selection or filter.",
      );
      return;
    }

    const result = await bulkUpdateTransactionCategoryAction({
      ids,
      categoryId: catId,
    });
    if (result.success) {
      toast.success(result.message);
      // Clear selection and refresh
      clearSelectionInternal();
      router.refresh();
    } else {
      toast.error(result.message || "Bulk update failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <CategorySelect
              categories={categories}
              value={bulkCatParam || undefined}
              onChange={setBulkCat}
              filter="all"
              placeholder="Bulk set category"
              triggerClassName="w-[220px]"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => void applyBulkCategory()}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  aria-label="Select visible"
                  className="h-4 w-4 rounded border"
                  checked={allVisibleSelected}
                  onChange={() =>
                    allVisibleSelected ? deselectVisible() : selectVisible()
                  }
                />
              </TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="w-[180px]">Category</TableHead>
              <TableHead className="w-[140px] text-right">Amount</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select transaction ${transaction.id}`}
                      className="h-4 w-4 rounded border"
                      checked={selectedSet.has(transaction.id)}
                      onChange={() => toggleRow(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                  <TableCell className="max-w-[16rem] truncate sm:max-w-[28rem]">
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.category?.name ?? "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "expense"
                        ? "text-destructive"
                        : "text-primary"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatCurrency(Number(transaction.amount))}
                  </TableCell>
                  <TableCell>
                    <EditTransactionDialog
                      transaction={transaction}
                      categories={categories}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
