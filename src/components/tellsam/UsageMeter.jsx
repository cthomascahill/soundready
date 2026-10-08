import { Link } from "react-router-dom";
import { Gauge, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The artist's AI fair-use meter: how much of this month's included AI
 * allowance is spent across every SAM feature (research, pitches, EPK,
 * recommendations, intel, deals), any extra purchased units, and the reset
 * date. Turns into a purchase prompt when the allowance is used up.
 */
export default function UsageMeter({ state, loading }) {
  if ((loading && !state) || !state) return null;

  const pct = Math.min(100, Math.round((state.includedUsed / Math.max(1, state.included)) * 100));
  const resets = new Date(state.resetsAt).toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const barColor = state.paused ? "bg-red-500" : state.warn ? "bg-yellow-500" : "bg-primary";

  return (
    <div className="px-5 py-3.5 border-t border-border bg-secondary/30 space-y-2">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Gauge className="h-3.5 w-3.5" /> AI usage this month
        </span>
        <span className={state.paused ? "text-red-400 font-semibold" : state.warn ? "text-yellow-400 font-semibold" : "text-muted-foreground"}>
          {state.includedUsed} / {state.included}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[10px] text-muted-foreground/80">
          {state.addonRemaining > 0 ? `+${state.addonRemaining} extra units available · ` : ""}Resets {resets}
        </p>
        {state.paused ? (
          <span className="text-[10px] text-red-400 font-medium">Allowance used up</span>
        ) : state.warn ? (
          <span className="text-[10px] text-yellow-400 font-medium">Running low</span>
        ) : null}
      </div>

      {state.paused && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2.5">
          <p className="text-[11px] text-red-400 leading-snug">
            Your monthly AI allowance is used up. Add extra usage to keep going today.
          </p>
          <Link to="/checkout/sam-extra-usage" className="shrink-0">
            <Button size="sm" className="h-7 text-[11px] gap-1.5 shrink-0">
              <Zap className="h-3 w-3" /> Add extra — $12
            </Button>
          </Link>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 leading-snug">
        One allowance covers every SAM feature: research, pitches, EPK, recommendations, industry intel, deals and digests.
        Usage is a workload estimate, not a dollar amount.
      </p>
    </div>
  );
}