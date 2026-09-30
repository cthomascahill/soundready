import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Starts a Stripe subscription checkout.
 * Works inside the builder preview (opens a new tab) and on the published
 * app (navigates the current page).
 */
export default function CheckoutButton({ tier, children, className = "", disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    setError("");
    setLoading(true);

    const isFramed = window.self !== window.top;
    const checkoutTab = isFramed ? window.open("", "_blank") : null;
    if (isFramed && !checkoutTab) {
      setLoading(false);
      setError("Allow popups to continue to checkout.");
      return;
    }
    if (checkoutTab) checkoutTab.opener = null;

    try {
      // Prefer the real top-level origin (custom domain / published app);
      // falls back to the published app URL inside cross-origin iframes.
      let appUrl = "https://soundready.base44.app";
      try { appUrl = window.top.location.origin; } catch (e) { /* cross-origin iframe */ }

      const res = await base44.functions.invoke("stripeCheckout", {
        action: "create_checkout",
        tier,
        app_url: appUrl,
      });
      const url = res.data?.url;
      if (!url) throw new Error(res.data?.error || "Could not start checkout");

      if (checkoutTab) checkoutTab.location.replace(url);
      else window.location.assign(url);
      // keep loading state while navigating away
    } catch (err) {
      checkoutTab?.close();
      setError(err.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button onClick={startCheckout} disabled={disabled || loading} className={`w-full font-semibold ${className}`}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Button>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}