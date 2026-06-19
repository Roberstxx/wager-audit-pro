import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "profit" | "loss" | "info" | "warning";
}

export function StatCard({ label, value, hint, icon, tone = "default" }: StatCardProps) {
  const toneClass = {
    default: "text-foreground",
    profit: "text-[color:var(--profit)]",
    loss: "text-[color:var(--loss)]",
    info: "text-[color:var(--info)]",
    warning: "text-[color:var(--warning)]",
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={cn("mt-2 font-display text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}
