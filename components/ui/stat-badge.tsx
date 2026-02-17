import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = "primary" | "secondary" | "accent" | "destructive" | "success";

const colorVariants: Record<ColorVariant, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-green-500/10 text-green-500",
};

interface StatBadgeProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color?: ColorVariant;
  className?: string;
}

function StatBadge({
  icon: Icon,
  value,
  label,
  color = "primary",
  className,
}: StatBadgeProps) {
  return (
    <div
      className={cn(
        "bg-background rounded-2xl border border-border/50 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colorVariants[color],
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-bold font-heading tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export { StatBadge };
export type { StatBadgeProps };
