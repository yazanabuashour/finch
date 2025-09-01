import { Skeleton } from "~/components/ui/skeleton";

export function CategoryBreakdownSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
