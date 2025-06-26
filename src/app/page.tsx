import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Overview } from "~/components/overview-chart";
import { RecentTransactions } from "~/components/recent-transactions";
import { MonthSummary } from "~/components/month-summary";
import {
  getTransactions,
  getMonthSummary,
  getMonthlyTrend,
} from "~/server/queries";
import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) {
    return <div>User not found</div>;
  }

  const transactions = await getTransactions(userId);
  const monthSummary = await getMonthSummary(
    userId,
    new Date().getFullYear(),
    new Date().getMonth() + 1,
  );
  const monthlyTrend = await getMonthlyTrend(userId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MonthSummary summary={monthSummary} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your monthly spending and income</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={monthlyTrend} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest expenses and income</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
