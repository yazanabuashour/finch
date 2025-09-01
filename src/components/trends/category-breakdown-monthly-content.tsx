import { CategoryBreakdown } from "~/components/category-breakdown";
import { getCategoryBreakdown } from "~/server/queries";

export default async function CategoryBreakdownMonthlyContent({
  userId,
  year,
  month,
}: {
  userId: string;
  year: number;
  month: number;
}) {
  const data = await getCategoryBreakdown(userId, year, month);
  return <CategoryBreakdown data={data} />;
}
