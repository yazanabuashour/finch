import { ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react";
import { CategoryChart } from "~/components/category-chart";
import { formatCurrency } from "~/lib/utils";
import { getCategoryBreakdown, getMonthSummary } from "~/server/queries";

export default async function CategoriesMonthlyContent({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) {
  const [categoryData, monthlySummary] = await Promise.all([
    getCategoryBreakdown(userId, year, month),
    getMonthSummary(userId, year, month),
  ]);

  return (
    <div className="space-y-4">
      <CategoryChart data={categoryData} />
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <div className="border-border/60 bg-muted/30 rounded-md border p-3">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <ArrowUpIcon className="h-4 w-4 text-emerald-400" />
            <span>Income</span>
          </div>
          <div className="font-semibold text-emerald-400">
            {formatCurrency(monthlySummary.totalIncome)}
          </div>
        </div>
        <div className="border-border/60 bg-muted/30 rounded-md border p-3">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <ArrowDownIcon className="h-4 w-4 text-red-400" />
            <span>Spending</span>
          </div>
          <div className="font-semibold text-red-400">
            {formatCurrency(monthlySummary.totalSpending)}
          </div>
        </div>
        <div className="border-border/60 bg-muted/30 rounded-md border p-3">
          <div className="text-muted-foreground mb-1 flex items-center gap-2">
            <Wallet
              className={
                monthlySummary.netSavings >= 0
                  ? "h-4 w-4 text-emerald-400"
                  : "h-4 w-4 text-red-400"
              }
            />
            <span>Net</span>
          </div>
          <div
            className={
              "font-semibold " +
              (monthlySummary.netSavings >= 0
                ? "text-emerald-400"
                : "text-red-400")
            }
          >
            {formatCurrency(monthlySummary.netSavings)}
          </div>
        </div>
      </div>
    </div>
  );
}
