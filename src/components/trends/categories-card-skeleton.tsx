import { Skeleton } from "~/components/ui/skeleton";

export function CategoriesCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[280px] w-full" />
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  );
}
