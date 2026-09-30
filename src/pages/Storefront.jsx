import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SoundReadyLogo from "@/components/SoundReadyLogo";
import { Button } from "@/components/ui/button";
import { Loader2, Disc3, ShoppingCart, AlertTriangle, Store, ExternalLink } from "lucide-react";

/**
 * Public storefront — anyone can browse this producer's beats and buy a
 * lease or exclusive with card. Instant download after payment.
 */
export default function Storefront() {
  const { producerId } = useParams();
  const [searchParams] = useSearchParams();
  const focusBeatId = searchParams.get("beat");
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [busyError, setBusyError] = useState("");

  useEffect(() => {
    base44.functions.invoke("beatStoreCheckout", { action: "get_store", producer_id: producerId })
      .then((res) => setStore(res.data))
      .catch((e) => setError(e?.response?.data?.error || "This store isn't available right now."))
      .finally(() => setLoading(false));
  }, [producerId]);

  const buy = async (beatId, dealType) => {
    if (busy) return;
    setBusyError("");
    const isFramed = window.self !== window.top;
    const checkoutTab = isFramed ? window.open("", "_blank") : null;
    if (isFramed && !checkoutTab) {
      setBusyError("Allow popups to continue to checkout.");
      return;
    }
    if (checkoutTab) checkoutTab.opener = null;
    setBusy(beatId + dealType);
    try {
      const res = await base44.functions.invoke("beatStoreCheckout", {
        action: "create_checkout",
        beat_id: beatId,
        deal_type: dealType,
        app_url: window.location.origin,
      });
      const url = res.data?.url;
      if (!url) throw new Error("Checkout could not be started.");
      if (checkoutTab) checkoutTab.location.replace(url);
      else window.location.assign(url);
    } catch (e) {
      checkoutTab?.close();
      setBusyError(e?.response?.data?.error || e.message || "Checkout could not be started.");
    } finally {
      setBusy("");
    }
  };

  const beats = (store?.beats || []).filter((b) => b.lease_price || b.exclusive_price);
  const focused = focusBeatId ? beats.find((b) => b.id === focusBeatId) : null;
  const shown = focused ? [focused] : beats;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <SoundReadyLogo size={26} />
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Powered by SoundReady
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-heading font-bold text-lg">{error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center sm:text-left">
              <p className="inline-flex items-center gap-1.5 text-xs text-primary uppercase tracking-widest font-bold">
                <Store className="h-3.5 w-3.5" /> Beat Store
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight">
                Beats by <span className="text-primary">{store.producer_name}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Instant download after payment. Card checkout, no account needed.
                {focused && " Buy this beat below."}
              </p>
            </div>

            {beats.length === 0 ? (
              <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
                <Disc3 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="font-heading font-bold text-lg">No beats for sale yet</p>
                <p className="text-sm text-muted-foreground">Check back soon.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${focused ? "grid-cols-1 max-w-xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                {shown.map((beat) => (
                  <div key={beat.id} className="rounded-2xl bg-card border border-border p-5 space-y-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Disc3 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-bold truncate">{beat.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[beat.genre, beat.bpm && `${beat.bpm} BPM`, beat.key].filter(Boolean).join(" · ") || "Beat"}
                        </p>
                      </div>
                    </div>

                    {(beat.mood_tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {beat.mood_tags.slice(0, 3).map((m) => (
                          <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{m}</span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      {beat.lease_price != null && (
                        <Button className="w-full gap-2 font-semibold" onClick={() => buy(beat.id, "Lease")} disabled={!!busy}>
                          {busy === beat.id + "Lease" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                          Buy Lease · ${beat.lease_price}
                        </Button>
                      )}
                      {beat.exclusive_price != null && (
                        <Button variant="outline" className="w-full gap-2 font-semibold" onClick={() => buy(beat.id, "Exclusive")} disabled={!!busy}>
                          {busy === beat.id + "Exclusive" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                          Buy Exclusive · ${beat.exclusive_price}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {busyError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
                {busyError}
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground/60">
              Secure card payment via Stripe · Your download link appears instantly after checkout
            </p>
          </>
        )}
      </div>
    </div>
  );
}