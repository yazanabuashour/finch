import { MonthlyTrendChart } from "~/components/monthly-trend-chart";
import { getMonthlyTrendByMonths } from "~/server/queries";

export default async function MonthlyTrendContent({
  userId,
  monthsRange,
}: {
  userId: string;
  monthsRange: number;
}) {
  const data = await getMonthlyTrendByMonths(userId, monthsRange);
  return <MonthlyTrendChart data={data} />;
}
