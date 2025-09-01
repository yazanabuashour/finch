"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useTransition,
  useState,
  useDeferredValue,
} from "react";
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
  const [query, setQuery] = useState(searchQuery);
  const deferredQuery = useDeferredValue(query);
  const selectedParam = searchParams.get("selected") ?? "";
  const bulkCatParam = searchParams.get("bulkCat") ?? "";
  const tabTypeParam = searchParams.get("type") ?? "all"; // ControlledTabs param

  const [selectedSet, setSelectedSet] = useState<Set<number>>(
    () =>
      new Set(
        selectedParam
          .split(",")
          .map((s) => parseInt(s, 10))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
  );

  const setParams = (updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Precompute a lowercased search index once per transaction set
  const searchIndex = useMemo(() => {
    const idx = new Map<number, string>();
    for (const t of transactions) {
      const s = `${t.description ?? ""} ${t.category?.name ?? ""}`
        .toLowerCase()
        .trim();
      idx.set(t.id, s);
    }
    return idx;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const byType = transactions.filter((t) =>
      filter === "all" ? true : t.type === filter,
    );
    if (!q) return byType;
    return byType.filter((t) => (searchIndex.get(t.id) ?? "").includes(q));
  }, [transactions, filter, deferredQuery, searchIndex]);

  const visibleIds = useMemo(
    () => filteredTransactions.map((t) => t.id),
    [filteredTransactions],
  );

  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const lastAnchorIndexRef = useRef<number | null>(null);
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
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRowClick = (
    e: React.MouseEvent,
    id: number,
    globalIndex: number,
  ) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("input,button,select,a,textarea,[role=button]")) return;
    // Toggle selection on row click: add if not selected, remove if selected
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastAnchorIndexRef.current = globalIndex;
  };

  const selectVisible = () => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const deselectVisible = () => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  // Removed unused selectAllLoaded helper to satisfy lint

  // Helper to clear selection is no longer exposed via UI, but retain inline usage after bulk apply.
  const clearSelectionInternal = () => setSelectedSet(new Set());

  // Search is kept in local state; avoid updating URL on each keystroke

  const [bulkCat, setBulkCat] = useState(bulkCatParam);

  // Determine effective bulk type based on current tab and selection
  const selectedTypes = useMemo(() => {
    const types = new Set<"expense" | "income">();
    for (const t of transactions) {
      if (selectedSet.has(t.id)) types.add(t.type);
    }
    return types;
  }, [transactions, selectedSet]);

  const bulkType: "expense" | "income" | null = useMemo(() => {
    if (filter === "expense" || filter === "income") return filter;
    if (selectedTypes.size === 1) return Array.from(selectedTypes)[0] ?? null;
    return null; // mixed or none
  }, [filter, selectedTypes]);

  // Clear stale bulk category when context changes (type or selection cleared)
  useEffect(() => {
    if (!bulkType || selectedSet.size === 0) {
      setBulkCat("");
    }
  }, [bulkType, selectedSet.size]);

  // Clear selection when tab (type param) changes to avoid cross-type carryover
  const prevTabTypeRef = useRef(tabTypeParam);
  useEffect(() => {
    if (prevTabTypeRef.current !== tabTypeParam) {
      prevTabTypeRef.current = tabTypeParam;
      setSelectedSet(new Set());
      setBulkCat("");
    }
  }, [tabTypeParam]);

  // Disable picker/apply if selection contains types that don't match effective bulkType
  const selectedMismatch = useMemo(() => {
    if (!bulkType) return false;
    if (selectedTypes.size === 0) return false;
    if (selectedTypes.size > 1) return true;
    return !selectedTypes.has(bulkType);
  }, [bulkType, selectedTypes]);

  const applyBulkCategory = async () => {
    const ids = Array.from(selectedSet);
    if (ids.length === 0) {
      toast.error("No rows selected.");
      return;
    }
    const catId = parseInt(bulkCat, 10);
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

  // Simple, no-deps row virtualization for large lists
  const ROW_HEIGHT = 48; // px, matches h-12 on data rows
  const OVERSCAN = 6;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const shouldVirtualize = filteredTransactions.length > 200;

  useEffect(() => {
    if (!shouldVirtualize) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollTop(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      setContainerHeight(el.clientHeight);
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [shouldVirtualize]);

  const total = filteredTransactions.length;
  const startIndex = shouldVirtualize
    ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
    : 0;
  const visibleCount = shouldVirtualize
    ? Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
    : total;
  const endIndex = shouldVirtualize
    ? Math.min(total, startIndex + Math.max(visibleCount, 1))
    : total;
  const slice = filteredTransactions.slice(startIndex, endIndex);
  const topPad = shouldVirtualize ? startIndex * ROW_HEIGHT : 0;
  const bottomPad = shouldVirtualize
    ? Math.max(0, (total - endIndex) * ROW_HEIGHT)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={(e) =>
              setParams((p) => {
                const v = e.target.value.trim();
                if (v) p.set("q", v);
                else p.delete("q");
              })
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <CategorySelect
              categories={categories}
              value={bulkCat || undefined}
              onChange={setBulkCat}
              filter={bulkType ?? "all"}
              placeholder={
                selectedSet.size === 0
                  ? "Select rows to enable"
                  : bulkType === null
                    ? "Mixed selection — refine type"
                    : "Bulk set category"
              }
              triggerClassName="w-[260px]"
              disabled={
                selectedSet.size === 0 || bulkType === null || selectedMismatch
              }
            />
            {selectedSet.size > 0 ? (
              <span className="text-muted-foreground text-sm">
                {selectedSet.size} selected
              </span>
            ) : null}
            {selectedSet.size > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedSet(new Set());
                  setBulkCat("");
                }}
              >
                Clear
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => void applyBulkCategory()}
              disabled={
                selectedSet.size === 0 || bulkType === null || selectedMismatch
              }
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <div
          ref={scrollRef}
          className={
            shouldVirtualize ? "max-h-[70vh] overflow-auto" : "overflow-visible"
          }
        >
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    aria-label="Select all results (current filter)"
                    title="Select all results (current filter)"
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
                <>
                  {shouldVirtualize && topPad > 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        style={{ height: topPad, padding: 0 }}
                      />
                    </TableRow>
                  ) : null}
                  {slice.map((transaction, i) => (
                    <TableRow
                      key={transaction.id}
                      className="h-12 cursor-pointer"
                      data-state={
                        selectedSet.has(transaction.id) ? "selected" : undefined
                      }
                      aria-selected={
                        selectedSet.has(transaction.id) || undefined
                      }
                      onClick={(e) =>
                        handleRowClick(e, transaction.id, startIndex + i)
                      }
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          aria-label={`Select transaction ${transaction.id}`}
                          className="h-4 w-4 rounded border"
                          checked={selectedSet.has(transaction.id)}
                          onClick={(e) => e.stopPropagation()}
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
                  ))}
                  {shouldVirtualize && bottomPad > 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        style={{ height: bottomPad, padding: 0 }}
                      />
                    </TableRow>
                  ) : null}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
