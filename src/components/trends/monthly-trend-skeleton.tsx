import { Skeleton } from "~/components/ui/skeleton";

export function MonthlyTrendSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-[320px] w-full" />
    </div>
  );
}
