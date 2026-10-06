import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const fmt = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function CatalogValuation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [monthly, setMonthly] = useState(2000);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const advance = monthly * 12; // 12 months of their revenue

  const handleInterested = async () => {
    setSubmitting(true);
    try {
      await base44.entities.CatalogBuyoutInterest.create({
        user_id: user.id,
        creator_name: user.full_name || user.email,
        creator_email: user.email,
        monthly_revenue: monthly,
        annual_revenue: advance,
        estimated_buyout: advance,
      });
      setSubmitted(true);
      toast({ title: "Application received", description: "SoundReady Records will reach out to " + user.email });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            <p className="text-xs text-primary uppercase tracking-widest font-medium">SoundReady Records</p>
          </div>
          <h2 className="font-heading text-xl font-bold">Get an advance on your catalog</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-md">
            Slide to your average monthly catalog revenue and see an estimated advance from SoundReady Records — 12 months of your revenue, paid upfront.
          </p>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 shrink-0">
          Estimate only · not a binding offer
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs text-zinc-500">Monthly catalog revenue</span>
              <span className="font-heading text-2xl font-bold text-primary tabular-nums">{fmt(monthly)}<span className="text-sm text-zinc-500 font-normal">/mo</span></span>
            </div>
            <Slider
              value={[monthly]}
              min={0}
              max={100000}
              step={500}
              onValueChange={([v]) => { setMonthly(v); setSubmitted(false); }}
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-2">
              <span>$0</span><span>$100,000</span>
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center gap-1.5 text-xs text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Estimated advance
            </div>
            <p className="font-heading text-3xl font-bold text-primary tabular-nums">{fmt(advance)}</p>
            <p className="text-[11px] text-zinc-500 mt-1">12 months of your catalog revenue, paid upfront</p>
          </div>
        </div>

        <div className="lg:w-56 shrink-0">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Application received</p>
              <p className="text-xs text-zinc-400 mt-1">SoundReady Records will follow up at your account email.</p>
            </motion.div>
          ) : (
            <Button onClick={handleInterested} disabled={submitting || monthly === 0}
              className="w-full h-12 text-base font-semibold gap-2">
              {submitting ? "Submitting..." : "Apply to get an advance"}
            </Button>
          )}
          <p className="text-[10px] text-zinc-600 text-center mt-2 leading-relaxed">
            Estimate equals 12 months of catalog revenue. Final terms depend on catalog review.
          </p>
        </div>
      </div>
    </div>
  );
}