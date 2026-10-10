import { Link } from "react-router-dom";
import { Zap, Users, Bot, BadgeCheck, ArrowRight, CalendarClock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getTier, trialDaysLeft } from "@/lib/tier";
import useSamUsage from "@/hooks/useSamUsage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PlanUsagePanel from "@/components/plan/PlanUsagePanel";
import CancelSubscriptionButton from "@/components/plan/CancelSubscriptionButton";

const PLANS = {
  free: { icon: Zap, name: "Free", price: "$0", color: "text-muted-foreground", desc: "Your music, organized." },
  pro: { icon: Users, name: "Artist Pro", price: "$39/month", color: "text-chart-5", desc: "Your career toolkit." },
  ai_manager: { icon: Bot, name: "Digital Manager", price: "$59/month", color: "text-primary", desc: "For artists who want help doing the work." },
};

/**
 * The "Your Plan" dashboard popup opened from the sidebar: current plan,
 * subscription status, SAM credit usage and quick plan actions.
 */
export default function PlanDashboardDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  // Fetch fresh numbers only while the popup is open
  const { usage } = useSamUsage({ enabled: open });

  const tier = getTier(user);
  const plan = PLANS[tier] || PLANS.free;
  const trialDays = trialDaysLeft(user);
  const isAIManager = tier === "ai_manager";

  const statusText =
    user?.subscription_status === "trialing" || (trialDays > 0 && isAIManager)
      ? `Free trial · ${trialDays} day${trialDays === 1 ? "" : "s"} left`
      : user?.subscription_status === "active"
        ? "Active"
        : tier === "free"
          ? "Free forever"
          : user?.subscription_status === "past_due"
            ? "Payment issue"
            : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden max-h-[85vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-1">
          <DialogTitle className="font-heading text-2xl font-bold">Your Plan</DialogTitle>
          <DialogDescription className="text-xs">
            Your subscription, SAM credit usage and plan actions in one place.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Current plan */}
          <div className="rounded-xl border border-border bg-secondary/30 p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isAIManager ? "bg-primary/10 border-primary/30" : "bg-chart-5/10 border-chart-5/20"
            }`}>
              <plan.icon className={`h-6 w-6 ${plan.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-heading font-black text-lg leading-tight">{plan.name}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${
                  statusText === "Payment issue"
                    ? "bg-red-500/10 border-red-500/25 text-red-400"
                    : "bg-primary/10 border-primary/25 text-primary"
                }`}>
                  <BadgeCheck className="h-3 w-3" /> {statusText}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{plan.price} · {plan.desc}</p>
            </div>
          </div>

          {/* SAM credit usage */}
          <PlanUsagePanel usage={usage} />

          {/* Plan actions */}
          <div className="space-y-2">
            {isAIManager && (
              <Link to="/checkout/sam-extra-usage" onClick={() => onOpenChange(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <Zap className="h-4 w-4" /> Add 1,500 extra credits — $15
                </Button>
              </Link>
            )}
            <Link to="/pricing-account" onClick={() => onOpenChange(false)}>
              <Button className="w-full gap-2">
                {isAIManager ? "Change plan" : "View plans & upgrade"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {tier !== "free" && !user?.cancel_at_period_end && (
              <CancelSubscriptionButton small hasStripeSub={!!user?.stripe_subscription_id} />
            )}
            <p className="text-center text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1">
              <CalendarClock className="h-3 w-3" /> Credits reset at the start of each month. Extra credits never expire.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}