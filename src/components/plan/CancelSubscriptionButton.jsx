import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction,
} from "@/components/ui/alert-dialog";

const fmtDate = (iso) => (iso ? moment(iso).format("MMMM D, YYYY") : null);

/**
 * The account's "Cancel subscription" button, shared by the Profile billing
 * panel and the "Your Plan" popup. With a live Stripe subscription it stops
 * renewals and keeps paid access until the period ends; without one (plan
 * granted without a completed checkout) the account moves to Free right away.
 */
export default function CancelSubscriptionButton({ small = false, hasStripeSub = false, paidThrough, onDone }) {
  const { checkAppState } = useAuth();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const res = await base44.functions.invoke("stripeCheckout", { action: "cancel" });
      if (res.data?.error) throw new Error(res.data.error);
      setOpen(false);
      await checkAppState();
      onDone?.();
    } catch (e) {
      setError(e.message || "Cancellation failed. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Button
        variant={small ? "ghost" : "outline"}
        className={small
          ? "w-full text-xs text-muted-foreground hover:text-destructive"
          : "gap-2 text-destructive border-destructive/40 hover:bg-destructive/10"}
        onClick={() => { setError(""); setOpen(true); }}
        disabled={cancelling}
      >
        {cancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Cancel subscription
      </Button>

      <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCancelling(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasStripeSub
                ? `You'll keep your paid features${paidThrough ? ` until ${fmtDate(paidThrough)}` : " until the end of your paid period"}. After that, your workspace moves to Free. Your saved work stays.`
                : "Your workspace will move to the Free plan now. Your saved work stays."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
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
    </>
  );
}