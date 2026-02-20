import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card text-center py-16 px-6",
        className,
      )}
    >
      {Icon && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pd-purple/10">
          <Icon
            className="h-8 w-8 text-pd-purple-light"
            aria-hidden="true"
          />
        </div>
      )}
      <h2 className="text-xl font-heading font-bold text-white mb-2">{title}</h2>
      {description && (
        <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
