import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CategoryChart } from "~/components/category-chart";
import { MonthlyTrendChart } from "~/components/monthly-trend-chart";
import { CategoryBreakdown } from "~/components/category-breakdown";
import { getCategoryBreakdown, getMonthlyTrend } from "~/server/queries";
import { auth } from "@clerk/nextjs/server";

export default async function TrendsPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div>User not found</div>;
  }
  const categoryBreakdown = await getCategoryBreakdown(
    userId,
    new Date().getFullYear(),
    new Date().getMonth() + 1,
  );
  const monthlyTrend = await getMonthlyTrend(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Spending Trends</h1>

      <Tabs defaultValue="categories" className="w-full">
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
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart data={monthlyTrend} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
