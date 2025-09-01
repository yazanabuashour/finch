import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CategoriesFilters } from "~/components/categories-filters";
import { MonthlyFilters } from "~/components/monthly-filters";
import { ControlledTabs } from "~/components/controlled-tabs";
import { getAvailableMonths } from "~/server/queries";
import { parseMonthParam, clamp } from "~/server/date-utils";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { Delayed } from "~/components/delayed";
import CategoriesMonthlyContent from "~/components/trends/categories-monthly-content";
import CategoriesYearlyContent from "~/components/trends/categories-yearly-content";
import CategoryBreakdownMonthlyContent from "~/components/trends/category-breakdown-monthly-content";
import CategoryBreakdownYearlyContent from "~/components/trends/category-breakdown-yearly-content";
import MonthlyTrendContent from "~/components/trends/monthly-trend-content";
import { CategoriesCardSkeleton } from "~/components/trends/categories-card-skeleton";
import { CategoryBreakdownSkeleton } from "~/components/trends/category-breakdown-skeleton";
import { MonthlyTrendSkeleton } from "~/components/trends/monthly-trend-skeleton";
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

  // Parse month for defaults and pass params to server components
  const monthlyYear = parsed?.year ?? now.getFullYear();
  const monthlyMonth = parsed?.month ?? now.getMonth() + 1;

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
                    <Suspense
                      key={`cat-monthly-${monthlyYear}-${monthlyMonth}`}
                      fallback={
                        <Delayed>
                          <CategoriesCardSkeleton />
                        </Delayed>
                      }
                    >
                      <CategoriesMonthlyContent
                        userId={userId}
                        year={monthlyYear}
                        month={monthlyMonth}
                      />
                    </Suspense>
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
                    <Suspense
                      key={`cat-yearly-${isYearValid ? yearFromParam! : monthlyYear}`}
                      fallback={
                        <Delayed>
                          <CategoriesCardSkeleton />
                        </Delayed>
                      }
                    >
                      <CategoriesYearlyContent
                        userId={userId}
                        year={isYearValid ? yearFromParam! : monthlyYear}
                      />
                    </Suspense>
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
                  <Suspense
                    key={`breakdown-yearly-${isYearValid ? yearFromParam! : monthlyYear}`}
                    fallback={
                      <Delayed>
                        <CategoryBreakdownSkeleton />
                      </Delayed>
                    }
                  >
                    <CategoryBreakdownYearlyContent
                      userId={userId}
                      year={isYearValid ? yearFromParam! : monthlyYear}
                    />
                  </Suspense>
                ) : (
                  <Suspense
                    key={`breakdown-monthly-${monthlyYear}-${monthlyMonth}`}
                    fallback={
                      <Delayed>
                        <CategoryBreakdownSkeleton />
                      </Delayed>
                    }
                  >
                    <CategoryBreakdownMonthlyContent
                      userId={userId}
                      year={monthlyYear}
                      month={monthlyMonth}
                    />
                  </Suspense>
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
              <Suspense
                key={`monthly-trend-${monthsRange}`}
                fallback={
                  <Delayed>
                    <MonthlyTrendSkeleton />
                  </Delayed>
                }
              >
                <MonthlyTrendContent
                  userId={userId}
                  monthsRange={monthsRange}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </ControlledTabs>
    </div>
  );
}
