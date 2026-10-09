import { Gauge, Zap } from "lucide-react";

/**
 * The SAM credit usage section of the plan dashboard: how much of this
 * month's included allowance is spent, any extra purchased credits, the
 * reset date, and a per-feature breakdown of where the credits went.
 */
export default function PlanUsagePanel({ usage }) {
  if (!usage) {
    return (
      <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-3">
        <div className="h-4 w-40 rounded bg-secondary animate-pulse" />
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-2/3 bg-secondary-foreground/10 animate-pulse" />
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((usage.includedUsed / Math.max(1, usage.included)) * 100));
  const resets = new Date(usage.resetsAt).toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const barColor = usage.paused ? "bg-red-500" : usage.warn ? "bg-yellow-500" : "bg-primary";
  const label = (k) => usage.features?.[k]?.label || k;
  const byFeature = Object.entries(usage.usageByFeature || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-heading font-semibold flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-primary" /> SAM credits this month
        </p>
        {usage.paused ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">Used up</span>
        ) : usage.warn ? (
          <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-400">Running low</span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Healthy</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="font-heading text-xl font-black text-primary">{usage.includedRemaining.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Credits left</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="font-heading text-xl font-black">{usage.includedUsed.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Used</p>
        </div>
        <div className="rounded-lg bg-background border border-border p-3 text-center">
          <p className="font-heading text-xl font-black flex items-center justify-center gap-1">
            <Zap className="h-4 w-4 text-yellow-400" />{usage.addonRemaining.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Extra credits</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground/80">
          {usage.includedUsed.toLocaleString()} of {usage.included.toLocaleString()} included credits used · Resets {resets}
        </p>
      </div>

      {byFeature.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Where credits went</p>
          {byFeature.map(([feature, units]) => (
            <div key={feature} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground truncate">{label(feature)}</span>
              <span className="font-semibold shrink-0">{units.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}