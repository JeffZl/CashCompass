import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "circular" | "rectangular" | "text";
  animation?: "pulse" | "shimmer";
}

function Skeleton({
  className,
  variant = "default",
  animation = "shimmer",
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    text: "rounded h-4 w-full",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "skeleton-shimmer",
  };

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/60 relative overflow-hidden",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton patterns
function SkeletonCard() {
  return (
    <div className="rounded-3xl glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function SkeletonSummaryCard() {
  return (
    <div className="rounded-3xl glass-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton variant="circular" className="h-12 w-12" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-3xl glass-card p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="h-64 flex items-end justify-around gap-2 pt-4">
        {[40, 70, 55, 80, 45, 65].map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function SkeletonTransactionList() {
  return (
    <div className="rounded-3xl glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton variant="circular" className="h-11 w-11" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="rounded-3xl glass-card overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-4 border-b border-border/30">
          <div className="flex gap-4">
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonSummaryCard,
  SkeletonChart,
  SkeletonTransactionList,
  SkeletonTable,
}
