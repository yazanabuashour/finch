import { Skeleton } from "~/components/ui/skeleton";

export default function ExpensesLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-64" />
        <div className="space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
