import { Skeleton } from "~/components/ui/skeleton";

export default function TrendsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-56" />

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-80" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-[360px]" />
        </div>
      </div>
    </div>
  );
}
