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
  getMonthlyTrendByMonths,
  getAvailableMonths,
} from "~/server/queries";
import { parseMonthParam, clamp } from "~/server/date-utils";
import { auth } from "@clerk/nextjs/server";
// months now fetched via getAvailableMonths

interface PageProps {
  searchParams?: Promise<{ month?: string; range?: string; tab?: string }>;
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
  const year = parsed?.year ?? now.getFullYear();
  const month = parsed?.month ?? now.getMonth() + 1; // 1-12

  const rangeParam = Number(sp.range ?? "");
  const monthsRange = clamp(
    Number.isFinite(rangeParam) ? rangeParam : 6,
    6,
    60,
  );

  const activeTab = sp.tab === "monthly" ? "monthly" : "categories";

  const categoryBreakdown = await getCategoryBreakdown(userId, year, month);
  const monthlyTrend = await getMonthlyTrendByMonths(userId, monthsRange);

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
                  Breakdown of your spending by category
                </CardDescription>
                <div className="pt-2">
                  <CategoriesFilters
                    defaultMonth={`${year}-${String(month).padStart(2, "0")}`}
                    currentRange={monthsRange}
                    months={availableMonths}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CategoryChart data={categoryBreakdown} />
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
                <CategoryBreakdown data={categoryBreakdown} />
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
                  currentMonth={`${year}-${String(month).padStart(2, "0")}`}
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
