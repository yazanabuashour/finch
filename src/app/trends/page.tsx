import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CategoryChart } from "~/components/category-chart";
import { MonthlyTrendChart } from "~/components/monthly-trend-chart";
import { CategoryBreakdown } from "~/components/category-breakdown";
import { CategoriesFilters } from "~/components/categories-filters";
import { MonthlyFilters } from "~/components/monthly-filters";
import { ControlledTabs } from "~/components/controlled-tabs";
import {
  getCategoryBreakdown,
  getCategoryBreakdownByYear,
  getMonthlyTrendByMonths,
  getAvailableMonths,
  getMonthSummary,
  getYearSummary,
} from "~/server/queries";
import { parseMonthParam, clamp } from "~/server/date-utils";
import { auth } from "@clerk/nextjs/server";
import { formatCurrency } from "~/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, Wallet } from "lucide-react";
// months now fetched via getAvailableMonths

interface PageProps {
  searchParams?: Promise<{
    month?: string;
    year?: string;
    range?: string;
    tab?: string;
    cview?: string;
  }>;
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    return <div>User not found</div>;
  }
  const sp = (await searchParams) ?? {};

  const availableMonths = await getAvailableMonths(userId);

  const selectedMonth = sp.month ?? availableMonths[0]?.value;
  const parsed = parseMonthParam(selectedMonth);
  const now = new Date();
  const selectedYearParam = sp.year;
  const yearFromParam = selectedYearParam
    ? Number(selectedYearParam)
    : undefined;
  const isYearValid = Number.isFinite(yearFromParam ?? NaN);
  const year = isYearValid
    ? yearFromParam!
    : (parsed?.year ?? now.getFullYear());
  // month value not used directly on this page; derive only when needed elsewhere

  const rangeParam = Number(sp.range ?? "");
  const monthsRange = clamp(
    Number.isFinite(rangeParam) ? rangeParam : 6,
    6,
    60,
  );

  const activeTab = sp.tab === "monthly" ? "monthly" : "categories";
  const categoriesView = sp.cview === "yearly" ? "yearly" : "monthly";

  // Prepare datasets for both views
  const monthlyYear = parsed?.year ?? now.getFullYear();
  const monthlyMonth = parsed?.month ?? now.getMonth() + 1;
  const monthlyCategoryBreakdown = await getCategoryBreakdown(
    userId,
    monthlyYear,
    monthlyMonth,
  );
  const yearlyCategoryBreakdown = await getCategoryBreakdownByYear(
    userId,
    isYearValid ? yearFromParam! : monthlyYear,
  );
  const yearlySummary = await getYearSummary(
    userId,
    isYearValid ? yearFromParam! : monthlyYear,
  );
  const monthlySummary = await getMonthSummary(
    userId,
    monthlyYear,
    monthlyMonth,
  );
  const monthlyTrend = await getMonthlyTrendByMonths(userId, monthsRange);

  // Build available years from available months
  const yearsSet = new Set<string>();
  for (const m of availableMonths) {
    const y = m.value?.split("-")[0];
    if (y) yearsSet.add(y);
  }
  const availableYears = Array.from(yearsSet)
    .sort((a, b) => Number(b) - Number(a))
    .map((y) => ({ value: y, label: y }));

  return (
    <div className="space-y-6">
      <h1 className="heading-gradient text-2xl font-bold">Spending Trends</h1>

      <ControlledTabs initialValue={activeTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  Switch between monthly and yearly views
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ControlledTabs initialValue={categoriesView} paramName="cview">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="monthly" className="space-y-4 pt-4">
                    <CategoriesFilters
                      mode="monthly"
                      defaultMonth={`${monthlyYear}-${String(monthlyMonth).padStart(2, "0")}`}
                      currentRange={monthsRange}
                      months={availableMonths}
                      years={availableYears}
                      defaultYear={String(year)}
                    />
                    <CategoryChart data={monthlyCategoryBreakdown} />
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
                  </TabsContent>
                  <TabsContent value="yearly" className="space-y-4 pt-4">
                    <CategoriesFilters
                      mode="yearly"
                      defaultMonth={`${monthlyYear}-${String(monthlyMonth).padStart(2, "0")}`}
                      currentRange={monthsRange}
                      months={availableMonths}
                      years={availableYears}
                      defaultYear={String(
                        isYearValid ? yearFromParam! : monthlyYear,
                      )}
                    />
                    <CategoryChart data={yearlyCategoryBreakdown} />
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                      <div className="border-border/60 bg-muted/30 rounded-md border p-3">
                        <div className="text-muted-foreground mb-1 flex items-center gap-2">
                          <ArrowUpIcon className="h-4 w-4 text-emerald-400" />
                          <span>Income</span>
                        </div>
                        <div className="font-semibold text-emerald-400">
                          {formatCurrency(yearlySummary.totalIncome)}
                        </div>
                      </div>
                      <div className="border-border/60 bg-muted/30 rounded-md border p-3">
                        <div className="text-muted-foreground mb-1 flex items-center gap-2">
                          <ArrowDownIcon className="h-4 w-4 text-red-400" />
                          <span>Spending</span>
                        </div>
                        <div className="font-semibold text-red-400">
                          {formatCurrency(yearlySummary.totalSpending)}
                        </div>
                      </div>
                      <div className="border-border/60 bg-muted/30 rounded-md border p-3">
                        <div className="text-muted-foreground mb-1 flex items-center gap-2">
                          <Wallet
                            className={
                              yearlySummary.netSavings >= 0
                                ? "h-4 w-4 text-emerald-400"
                                : "h-4 w-4 text-red-400"
                            }
                          />
                          <span>Net</span>
                        </div>
                        <div
                          className={
                            "font-semibold " +
                            (yearlySummary.netSavings >= 0
                              ? "text-emerald-400"
                              : "text-red-400")
                          }
                        >
                          {formatCurrency(yearlySummary.netSavings)}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </ControlledTabs>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Detailed view of your spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoriesView === "yearly" ? (
                  <CategoryBreakdown data={yearlyCategoryBreakdown} />
                ) : (
                  <CategoryBreakdown data={monthlyCategoryBreakdown} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                Your spending and income trends over time
              </CardDescription>
              <div className="pt-2">
                <MonthlyFilters
                  defaultRange={monthsRange}
                  currentMonth={`${monthlyYear}-${String(monthlyMonth).padStart(2, "0")}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={monthlyTrend} />
            </CardContent>
          </Card>
        </TabsContent>
      </ControlledTabs>
    </div>
  );
}
