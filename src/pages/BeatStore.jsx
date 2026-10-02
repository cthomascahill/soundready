import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Store, Copy, Check, Loader2, Disc3, ExternalLink, DollarSign, ShoppingCart, Link2,
} from "lucide-react";

/**
 * Beat Store — the producer's storefront manager. Toggle beats for sale,
 * share the public store and per-beat checkout links, and track sales revenue.
 */
export default function BeatStore() {
  const { user } = useAuth();
  const [beats, setBeats] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Beat.filter({ created_by_id: user.id }, "-created_date", 200)
      .then(setBeats)
      .catch(() => setBeats([]))
      .finally(() => setLoading(false));
    base44.entities.BeatSale.filter({ producer_id: user.id }, "-created_date", 100)
      .then(setSales)
      .catch(() => setSales([]));
  }, [user]);

  const storeUrl = user?.id ? `${window.location.origin}/store/${user.id}` : "";
  const beatUrl = (beatId) => `${storeUrl}?beat=${beatId}`;

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const toggleForSale = async (beat) => {
    if (busyId === beat.id) return;
    if (!beat.for_sale && !beat.lease_price && !beat.exclusive_price) {
      setError(`Set a lease or exclusive price for "${beat.title}" in your Productions before listing it.`);
      return;
    }
    setError("");
    setBusyId(beat.id);
    try {
      const updated = await base44.entities.Beat.update(beat.id, { for_sale: !beat.for_sale });
      setBeats((prev) => prev.map((b) => (b.id === beat.id ? updated : b)));
    } finally {
      setBusyId("");
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const listedCount = beats.filter((b) => b.for_sale).length;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Producer</p>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" /> Beat Store
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your own storefront — list beats for sale, share checkout links anywhere, and get paid. Buyers pay by card
            and get instant download delivery.
          </p>
        </div>

        {/* Storefront link */}
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Your public storefront</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {listedCount} beat{listedCount === 1 ? "" : "s"} listed · anyone can browse and buy — no account needed
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(storeUrl, "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" /> View Store
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => copy(storeUrl, "store")}>
                {copied === "store" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === "store" ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono truncate">{storeUrl}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Catalog */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : beats.length === 0 ? (
          <div className="rounded-2xl bg-card border border-dashed border-border p-12 text-center space-y-3">
            <Disc3 className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="font-heading font-bold text-lg">No beats to list yet</p>
            <p className="text-sm text-muted-foreground">Upload beats in your Productions, set prices, and list them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {beats.map((beat) => (
              <div key={beat.id} className={`rounded-2xl bg-card border p-5 space-y-3 transition-colors ${beat.for_sale ? "border-primary/30" : "border-border"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{beat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[beat.genre, beat.bpm && `${beat.bpm} BPM`].filter(Boolean).join(" · ") || "No tags"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    beat.for_sale ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-border"
                  }`}>
                    {beat.for_sale ? "Listed" : "Not Listed"}
                  </span>
                </div>

                <div className="flex gap-3 text-xs text-muted-foreground">
                  {beat.lease_price != null && <span>Lease <span className="text-foreground font-semibold">${beat.lease_price}</span></span>}
                  {beat.exclusive_price != null && <span>Exclusive <span className="text-foreground font-semibold">${beat.exclusive_price}</span></span>}
                  {!beat.lease_price && !beat.exclusive_price && <span className="text-yellow-400">No prices set — add them in the Productions</span>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={beat.for_sale ? "outline" : "default"}
                    className="gap-1.5"
                    onClick={() => toggleForSale(beat)}
                    disabled={busyId === beat.id}
                  >
                    {busyId === beat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                    {beat.for_sale ? "Unlist" : "List for Sale"}
                  </Button>
                  {beat.for_sale && (
                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => copy(beatUrl(beat.id), beat.id)}>
                      {copied === beat.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Link2 className="h-3.5 w-3.5" />}
                      {copied === beat.id ? "Copied" : "Checkout Link"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sales */}
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Store Sales
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">Total Revenue</p>
                <p className="font-heading text-2xl font-black text-primary">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">Sales</p>
                <p className="font-heading text-2xl font-black">{sales.length}</p>
              </div>
            </div>
          </div>
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No sales yet — list a beat and drop your store link in your bio, YouTube descriptions, and DMs.
            </p>
          ) : (
            <div className="space-y-2">
              {sales.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{s.beat_title || "Beat"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {s.buyer_email || "Anonymous buyer"} · {s.deal_type}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">${(s.amount || 0).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(s.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}