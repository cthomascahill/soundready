import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { trialDaysLeft } from "@/lib/tier";
import { Clock, X, Loader2 } from "lucide-react";

/**
 * Persistent banner shown during the 7-day Artist Pro trial:
 * days remaining + cancel link (cancelling during trial = never charged).
 */
export default function TrialBanner() {
  const { user, checkAppState } = useAuth();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.subscription_status !== "trialing" || !user.trial_ends_at) return null;

  const daysLeft = trialDaysLeft(user);
  const chargeDate = new Date(user.trial_ends_at).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const handleCancel = async () => {
    setCanceling(true);
    setError("");
    const res = await base44.functions.invoke("stripeCheckout", { action: "cancel" })
      .catch(e => ({ data: { error: e.message } }));
    setCanceling(false);
    if (res.data?.error) { setError(res.data.error); return; }
    await checkAppState();
  };

  return (
    <div className="border-b border-primary/20 bg-primary/10">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <span>
            <span className="font-semibold text-primary">Artist Pro free trial</span>
            <span className="text-muted-foreground"> — {daysLeft} {daysLeft === 1 ? "day" : "days"} left. Your card is charged $39 on {chargeDate}.</span>
          </span>
        </div>
        <button
          onClick={handleCancel}
          disabled={canceling}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 disabled:opacity-50"
        >
          {canceling ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          Cancel trial
        </button>
      </div>
      {error && <p className="px-4 pb-2 text-xs text-destructive max-w-7xl mx-auto">{error}</p>}
    </div>
  );
}