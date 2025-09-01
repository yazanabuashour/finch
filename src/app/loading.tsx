import { Skeleton } from "~/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="space-y-3 lg:col-span-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-[350px]" />
        </div>
        <div className="space-y-3 lg:col-span-3">
          <Skeleton className="h-10" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
