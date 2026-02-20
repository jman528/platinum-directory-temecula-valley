import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "text" | "stats" | "profile";
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ variant = "card", className, count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "text") {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton-glass h-4 w-3/4" />
            <div className="skeleton-glass h-4 w-full" />
            <div className="skeleton-glass h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
        {items.map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="skeleton-glass h-3 w-20" />
            <div className="skeleton-glass h-8 w-24" />
            <div className="skeleton-glass h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className={cn("glass-card p-6", className)}>
        <div className="flex items-center gap-4">
          <div className="skeleton-glass h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton-glass h-5 w-40" />
            <div className="skeleton-glass h-4 w-56" />
            <div className="skeleton-glass h-3 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="flex items-start gap-4">
            <div className="skeleton-glass h-16 w-16 rounded-lg flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="skeleton-glass h-5 w-3/4" />
              <div className="skeleton-glass h-4 w-1/2" />
              <div className="skeleton-glass h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
