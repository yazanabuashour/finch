import { CategoryBreakdown } from "~/components/category-breakdown";
import { getCategoryBreakdownByYear } from "~/server/queries";

export default async function CategoryBreakdownYearlyContent({
  userId,
  year,
}: {
  userId: string;
  year: number;
}) {
  const data = await getCategoryBreakdownByYear(userId, year);
  return <CategoryBreakdown data={data} />;
}
