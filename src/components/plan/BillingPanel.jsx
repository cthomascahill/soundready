import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Loader2, AlertTriangle, RotateCcw, Zap } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getTier } from "@/lib/tier";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction,
} from "@/components/ui/alert-dialog";

const PLAN_NAMES = { free: "Free", pro: "Artist Pro", ai_manager: "Digital Manager" };
const fmtDate = (iso) =>
  iso ? moment(iso).format("MMMM D, YYYY") : "the end of your paid period";

/**
 * Settings → Billing: the live subscription as Stripe sees it — plan,
 * frequency, renewal date and amount — with cancel / resume actions.
 * Success is only shown after Stripe confirms the change.
 */
export default function BillingPanel() {
  const { user, checkAppState } = useAuth();
  const tier = getTier(user);
  const isPaid = tier === "pro" || tier === "ai_manager";
  const subId = user?.stripe_subscription_id;

  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  // Live subscription details straight from Stripe
  const loadSubscription = async () => {
    if (!subId) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("stripeCheckout", { action: "get_subscription" });
      if (res.data?.error) throw new Error(res.data.error);
      setSub(res.data?.subscription);
    } catch (e) {
      setActionError(e.message || "Could not load your billing details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (subId) loadSubscription(); }, [subId]);

  const handleCancel = async () => {
    setCancelling(true);
    setActionError("");
    try {
      const res = await base44.functions.invoke("stripeCheckout", { action: "cancel" });
      if (res.data?.error) throw new Error(res.data.error);
      // Stripe confirmed: renewals stop, paid access runs until period end
      setSub((s) => ({ ...s, cancel_at_period_end: true }));
      setDialogOpen(false);
      await checkAppState();
    } catch (e) {
      setActionError(e.message || "Cancellation failed. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleResume = async () => {
    setResuming(true);
    setActionError("");
    try {
      const res = await base44.functions.invoke("stripeCheckout", { action: "resume" });
      if (res.data?.error) throw new Error(res.data.error);
      setSub((s) => ({ ...s, cancel_at_period_end: false }));
      await checkAppState();
    } catch (e) {
      setActionError(e.message || "Could not resume your subscription. Please try again.");
    } finally {
      setResuming(false);
    }
  };

  // Free plan: nothing to cancel, no button shown
  if (!isPaid) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <p className="font-heading font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" /> Billing
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm flex-1">
            <span className="font-semibold">You're on the Free plan.</span>{" "}
            <span className="text-muted-foreground">No card on file, nothing to cancel.</span>
          </p>
          <Link to="/pricing-account">
            <Button variant="outline" className="gap-2"><Zap className="h-4 w-4" /> View plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canceled = sub?.cancel_at_period_end || user?.cancel_at_period_end;
  const paidThrough = sub?.current_period_end || user?.trial_ends_at;
  const intervalLabel = sub?.interval === "year" ? "Yearly" : "Monthly";
  const amountLabel = sub ? `$${(sub.amount || 0).toFixed(2)}/${sub.interval === "year" ? "year" : "month"}` : null;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <p className="font-heading font-semibold flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-primary" /> Billing
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div className="flex justify-between sm:block sm:space-y-0.5">
          <span className="text-muted-foreground">Current plan</span>
          <p className="font-semibold">{PLAN_NAMES[tier] || "Artist Pro"}</p>
        </div>
        <div className="flex justify-between sm:block sm:space-y-0.5">
          <span className="text-muted-foreground">Billing frequency</span>
          <p className="font-semibold">{loading ? "…" : intervalLabel}</p>
        </div>
        {canceled ? (
          <div className="flex justify-between sm:block sm:space-y-0.5 sm:col-span-2">
            <span className="text-muted-foreground">Status</span>
            <p className="font-semibold text-yellow-400">Canceled — access ends {fmtDate(paidThrough)}.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between sm:block sm:space-y-0.5">
              <span className="text-muted-foreground">Renews on</span>
              <p className="font-semibold">{loading ? "…" : fmtDate(paidThrough)}</p>
            </div>
            <div className="flex justify-between sm:block sm:space-y-0.5">
              <span className="text-muted-foreground">Renewal amount</span>
              <p className="font-semibold">{loading ? "…" : (amountLabel || "—")}</p>
            </div>
          </>
        )}
      </div>

      {actionError && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> {actionError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canceled ? (
          <Button variant="outline" className="gap-2" onClick={handleResume} disabled={resuming || !subId}>
            {resuming ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Resume subscription
          </Button>
        ) : subId ? (
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => { setActionError(""); setDialogOpen(true); }}
            disabled={loading}
          >
            Cancel subscription
          </Button>
        ) : null}
        <Link to="/pricing-account">
          <Button variant="ghost" className="text-muted-foreground">Change plan</Button>
        </Link>
      </div>

      {/* Cancellation confirmation — no surveys, no retention screens */}
      <AlertDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setCancelling(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll keep your paid features until {fmtDate(paidThrough)}. After that, your workspace
              moves to Free. Your saved work stays.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={cancelling}>Keep subscription</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={(e) => { e.preventDefault(); handleCancel(); }}
                disabled={cancelling}
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm cancellation
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}