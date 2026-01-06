import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && trendValue && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend === "up" && "bg-success/10 text-success",
              trend === "down" && "bg-destructive/10 text-destructive",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {value}
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </motion.div>
  );
}
